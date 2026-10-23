import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Mic2,
  Tv,
  Smartphone,
  Search,
  Settings,
} from 'lucide-react';
import { KaraokeSong } from './data/karaokeCatalog';
import { TVPlayerView } from './components/TVPlayerView';
import { MobileRemoteView } from './components/MobileRemoteView';
import { TVSearchModal } from './components/TVSearchModal';
import { KaraokeScoreModal } from './components/KaraokeScoreModal';
import { AndroidTVInstallerModal } from './components/AndroidTVInstallerModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { syncEngine, RoomCommand } from './utils/syncEngine';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function App() {
  // Mode: TV vs Mobile Remote
  const [mode, setMode] = useState<'tv' | 'mobile'>('tv');
  const [roomCode, setRoomCode] = useState<string>('6868');
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  // Playback state - Completely clean initial queue (no pre-seeded default songs)
  const [currentSong, setCurrentSong] = useState<KaraokeSong | null>(null);
  const [queue, setQueue] = useState<KaraokeSong[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(100);
  const [pitch, setPitch] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [isInstallerOpen, setIsInstallerOpen] = useState(false);
  const [lastFinishedSongTitle, setLastFinishedSongTitle] = useState('');

  const ytPlayerRef = useRef<any>(null);
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentSongRef = useRef<KaraokeSong | null>(currentSong);
  currentSongRef.current = currentSong;

  const queueRef = useRef<KaraokeSong[]>(queue);
  queueRef.current = queue;

  // App & Mobile URL calculation (initialized synchronously)
  const [appUrl, setAppUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}`;
    }
    return '';
  });
  const [mobileUrl, setMobileUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}?room=6868&mode=mobile`;
    }
    return '';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const path = window.location.pathname;
      const base = `${origin}${path}`;
      setAppUrl(base);
      setMobileUrl(`${base}?room=${roomCode}&mode=mobile`);

      // Read query params for room and mode
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      const urlMode = params.get('mode');

      if (urlRoom) {
        setRoomCode(urlRoom.toUpperCase());
      }

      if (urlMode === 'mobile') {
        setMode('mobile');
      } else if (urlMode === 'tv') {
        setMode('tv');
      } else {
        // Auto detect mobile device
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
        if (isMobileDevice) {
          setMode('mobile');
        } else {
          setMode('tv');
        }
      }
    }
  }, []);

  // Update mobile URL when roomCode changes
  useEffect(() => {
    if (appUrl) {
      setMobileUrl(`${appUrl}?room=${roomCode}&mode=mobile`);
    }
    syncEngine.initRoom(roomCode);
  }, [roomCode, appUrl]);

  const lastAddedRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });

  // Custom playback time tracking (replaces cluttered YouTube controls bar)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Poll current time and duration when playing
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
          try {
            const cur = ytPlayerRef.current.getCurrentTime() || 0;
            const dur = ytPlayerRef.current.getDuration() || 0;
            setCurrentTime(cur);
            if (dur > 0) setDuration(dur);
          } catch (e) {}
        }
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const handleSeek = useCallback((seconds: number) => {
    if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      try {
        ytPlayerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);
      } catch (e) {}
    }
  }, []);

  // Play video with forced 1080p resolution and subtitles disabled
  const playVideoWith1080p = useCallback((videoId: string) => {
    setCurrentTime(0);
    setDuration(0);
    if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
      ytPlayerRef.current.loadVideoById({
        videoId,
        suggestedQuality: 'hd1080',
      });
      try {
        ytPlayerRef.current.setPlaybackQuality('hd1080');
        if (ytPlayerRef.current.unloadModule) {
          ytPlayerRef.current.unloadModule('captions');
          ytPlayerRef.current.unloadModule('cc');
        }
        if (ytPlayerRef.current.setOption) {
          ytPlayerRef.current.setOption('captions', 'track', {});
          ytPlayerRef.current.setOption('cc', 'track', {});
        }
      } catch (e) {}
      setIsPlaying(true);
    }
  }, []);

  // YouTube Player initialization (controls: 0 removes YouTube buttons, 'Video khác' recommendations, and YouTube logo)
  const initYouTubePlayer = useCallback(() => {
    if (typeof window === 'undefined' || !window.YT || !window.YT.Player) {
      return;
    }
    const container = document.getElementById('youtube-player');
    if (!container || ytPlayerRef.current) return;

    try {
      ytPlayerRef.current = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: currentSongRef.current ? currentSongRef.current.id : '',
        playerVars: {
          autoplay: 1,
          controls: 0, // Xoá hoàn toàn thanh điều khiển YouTube (xóa button chia sẻ, xem sau, nút YouTube, đề cử)
          rel: 0, // Không đề xuất video từ kênh khác
          modestbranding: 1, // Xóa logo YouTube
          playsinline: 1,
          enablejsapi: 1,
          cc_load_policy: 0, // Bỏ mở phụ đề trên youtube (tắt captions)
          iv_load_policy: 3, // Bỏ chú thích video và pop-up 'Video khác'
          disablekb: 1, // TV remote xử lý phím tắt
          fs: 0, // Bỏ nút fullscreen mặc định của YouTube
          hl: 'vi',
        },
        events: {
          onReady: (event: any) => {
            try {
              event.target.setPlaybackQuality('hd1080');
              if (event.target.unloadModule) {
                event.target.unloadModule('captions');
                event.target.unloadModule('cc');
              }
            } catch (e) {}
            if (currentSongRef.current) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 0) {
              const finishedTitle = currentSongRef.current?.title || 'Bài hát Karaoke';
              setLastFinishedSongTitle(finishedTitle);
              setIsScoreOpen(true);
            } else if (event.data === 1) {
              setIsPlaying(true);
              // Luôn đặt mặc định chất lượng video là 1080p và bỏ phụ đề
              try {
                event.target.setPlaybackQuality('hd1080');
                if (event.target.unloadModule) {
                  event.target.unloadModule('captions');
                  event.target.unloadModule('cc');
                }
                if (event.target.setOption) {
                  event.target.setOption('captions', 'track', {});
                  event.target.setOption('cc', 'track', {});
                }
              } catch (e) {}
            } else if (event.data === 2) {
              setIsPlaying(false);
            }
          },
        },
      });
    } catch (err) {
      console.error('Error initializing YouTube player:', err);
    }
  }, []);

  useEffect(() => {
    if (mode === 'tv') {
      if (window.YT && window.YT.Player) {
        initYouTubePlayer();
      } else {
        window.onYouTubeIframeAPIReady = () => {
          initYouTubePlayer();
        };
      }
    }
  }, [mode, initYouTubePlayer]);

  // Play next song
  const handlePlayNext = useCallback(() => {
    setIsScoreOpen(false);
    const curQueue = queueRef.current;
    if (curQueue.length > 0) {
      const [nextSong, ...rest] = curQueue;
      setCurrentSong(nextSong);
      setQueue(rest);
      playVideoWith1080p(nextSong.id);
    } else {
      setCurrentSong(null);
      setIsPlaying(false);
      if (ytPlayerRef.current && ytPlayerRef.current.stopVideo) {
        ytPlayerRef.current.stopVideo();
      }
    }
  }, [playVideoWith1080p]);

  // Add to queue or play now with deduplication guard
  const handleAddToQueue = useCallback(
    (song: KaraokeSong, playNow: boolean) => {
      // Prevent duplicate additions if clicked repeatedly within 1.2s
      const now = Date.now();
      if (lastAddedRef.current.id === song.id && now - lastAddedRef.current.time < 1200) {
        return;
      }
      lastAddedRef.current = { id: song.id, time: now };

      if (playNow) {
        if (!currentSongRef.current) {
          setCurrentSong(song);
          playVideoWith1080p(song.id);
        } else {
          setQueue((prev) => [song, ...prev]);
          setCurrentSong(song);
          playVideoWith1080p(song.id);
        }
      } else {
        if (!currentSongRef.current) {
          setCurrentSong(song);
          playVideoWith1080p(song.id);
        } else {
          setQueue((prev) => [...prev, song]);
        }
      }

      syncEngine.sendCommand({
        action: 'addToQueue',
        payload: { song, playNow },
      });
    },
    [playVideoWith1080p]
  );

  const handleRemoveFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    syncEngine.sendCommand({
      action: 'removeFromQueue',
      payload: { index },
    });
  }, []);

  const handlePrioritize = useCallback((index: number) => {
    setQueue((prev) => {
      if (index <= 0 || index >= prev.length) return prev;
      const item = prev[index];
      const nextQueue = prev.filter((_, i) => i !== index);
      return [item, ...nextQueue];
    });
    syncEngine.sendCommand({
      action: 'prioritize',
      payload: { index },
    });
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (!ytPlayerRef.current) return;
    try {
      if (isPlayingRef.current) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleReplay = useCallback(() => {
    if (!ytPlayerRef.current) return;
    try {
      ytPlayerRef.current.seekTo(0);
      ytPlayerRef.current.playVideo();
      setIsPlaying(true);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    if (!ytPlayerRef.current) return;
    try {
      if (isMuted) {
        ytPlayerRef.current.unMute();
        setIsMuted(false);
      } else {
        ytPlayerRef.current.mute();
        setIsMuted(true);
      }
    } catch (e) {
      console.warn(e);
    }
  }, [isMuted]);

  const handleChangePitch = useCallback((delta: number) => {
    setPitch((prev) => {
      const next = Math.max(-3, Math.min(3, prev + delta));
      syncEngine.sendCommand({ action: 'setPitch', payload: next });
      return next;
    });
  }, []);

  const handleChangeSpeed = useCallback((delta: number) => {
    setSpeed((prev) => {
      const next = Math.max(0.75, Math.min(1.5, Number((prev + delta).toFixed(2))));
      if (ytPlayerRef.current && ytPlayerRef.current.setPlaybackRate) {
        ytPlayerRef.current.setPlaybackRate(next);
      }
      syncEngine.sendCommand({ action: 'setSpeed', payload: next });
      return next;
    });
  }, []);

  const handleSendSfx = useCallback((type: string) => {
    syncEngine.sendCommand({ action: 'sfx', payload: type });
  }, []);

  // Listen for remote commands
  useEffect(() => {
    const unsub = syncEngine.onCommand((cmd: RoomCommand) => {
      switch (cmd.action) {
        case 'togglePlay':
          handleTogglePlay();
          break;
        case 'next':
          handlePlayNext();
          break;
        case 'replay':
          handleReplay();
          break;
        case 'toggleMute':
          handleToggleMute();
          break;
        case 'score':
          setIsScoreOpen(true);
          break;
        case 'addToQueue':
          if (cmd.payload?.song) {
            const { song, playNow } = cmd.payload;
            const now = Date.now();
            if (lastAddedRef.current.id === song.id && now - lastAddedRef.current.time < 1200) {
              break;
            }
            lastAddedRef.current = { id: song.id, time: now };

            if (playNow) {
              setCurrentSong(song);
              playVideoWith1080p(song.id);
            } else {
              setQueue((prev) => [...prev, song]);
              if (!currentSongRef.current) {
                setCurrentSong(song);
                playVideoWith1080p(song.id);
              }
            }
          }
          break;
        case 'removeFromQueue':
          if (typeof cmd.payload?.index === 'number') {
            setQueue((prev) => prev.filter((_, i) => i !== cmd.payload.index));
          }
          break;
        case 'prioritize':
          if (typeof cmd.payload?.index === 'number') {
            const idx = cmd.payload.index;
            setQueue((prev) => {
              if (idx <= 0 || idx >= prev.length) return prev;
              const item = prev[idx];
              const rest = prev.filter((_, i) => i !== idx);
              return [item, ...rest];
            });
          }
          break;
      }
    });

    return () => {
      unsub();
    };
  }, [handleTogglePlay, handlePlayNext, handleReplay, handleToggleMute]);

  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [searchAutoVoice, setSearchAutoVoice] = useState(false);

  const handleOpenSearch = useCallback((query: string = '', autoVoice: boolean = false) => {
    setSearchInitialQuery(query);
    setSearchAutoVoice(autoVoice);
    setIsSearchOpen(true);
  }, []);

  // Android TV Remote Control D-Pad & Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'KeyN':
          e.preventDefault();
          handlePlayNext();
          break;
        case 'KeyR':
          e.preventDefault();
          handleReplay();
          break;
        case 'KeyF':
          e.preventDefault();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
        case 'KeyS':
        case 'Slash':
          e.preventDefault();
          handleOpenSearch('', false);
          break;
        case 'KeyV':
          e.preventDefault();
          handleOpenSearch('', true);
          break;
        case 'KeyM':
          e.preventDefault();
          handleToggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handlePlayNext, handleReplay, handleToggleMute]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0a0c] text-white font-sans antialiased relative">
      {/* GLOBAL TOP NAVIGATION & MODE SWITCHER (AUTO-HIDING) */}
      <div
        className="relative z-50 shrink-0"
        onMouseEnter={() => setIsHeaderVisible(true)}
        onMouseLeave={() => setIsHeaderVisible(false)}
      >
        {/* Slim hovering trigger handle indicator */}
        <div
          className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
            isHeaderVisible
              ? 'opacity-0 pointer-events-none -translate-y-full'
              : 'opacity-70 hover:opacity-100 translate-y-0'
          }`}
        >
          <button
            onClick={() => setIsHeaderVisible(true)}
            className="bg-black/80 hover:bg-black/95 backdrop-blur-md px-3.5 py-1 rounded-b-xl border-x border-b border-neutral-700 text-[11px] font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 shadow-xl cursor-pointer"
          >
            <span>Menu & Chế độ</span>
            <span className="text-[9px]">▼</span>
          </button>
        </div>

        {/* Sliding Header (Auto-hiding on mouse enter/leave) */}
        <header
          className={`fixed top-0 left-0 right-0 h-14 bg-[#141417]/95 backdrop-blur-md border-b border-neutral-800 px-4 flex items-center justify-between transition-transform duration-300 shadow-2xl ${
            isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          {/* Brand - Removed 'TV & REMOTE' per user request */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-md shadow-red-900/50">
              <Mic2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-sm tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-red-400">
                OANH ĐIỀN KARAOKE
              </span>
            </div>
          </div>

          {/* Center Mode Switch */}
          <div className="flex items-center bg-black/60 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => {
                setMode('tv');
                setIsHeaderVisible(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                mode === 'tv'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Màn Hình TV</span>
            </button>
            <button
              onClick={() => {
                setMode('mobile');
                setIsHeaderVisible(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                mode === 'mobile'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Điện Thoại (Remote)</span>
            </button>
          </div>

          {/* Right Actions: Settings button instead of "Cài APK / Tivi" */}
          <div className="flex items-center gap-2">
            <PWAInstallButton />
            <button
              onClick={() => setIsInstallerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-xl text-xs font-semibold border border-neutral-700 transition shadow"
              title="Cài đặt & Hướng dẫn sử dụng"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Cài đặt</span>
            </button>
          </div>
        </header>
      </div>

      {/* VIEW CONTAINER */}
      <main className="flex-1 flex overflow-hidden">
        {mode === 'tv' ? (
          <TVPlayerView
            currentSong={currentSong}
            queue={queue}
            isPlaying={isPlaying}
            isMuted={isMuted}
            volume={volume}
            pitch={pitch}
            speed={speed}
            roomCode={roomCode}
            mobileUrl={mobileUrl}
            onPlayNext={handlePlayNext}
            onTogglePlay={handleTogglePlay}
            onReplay={handleReplay}
            onToggleMute={handleToggleMute}
            onRemoveFromQueue={handleRemoveFromQueue}
            onPrioritize={handlePrioritize}
            onOpenSearch={handleOpenSearch}
            onOpenInstaller={() => setIsInstallerOpen(true)}
            onTriggerScore={() => setIsScoreOpen(true)}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />
        ) : (
          <MobileRemoteView
            currentSong={currentSong}
            queue={queue}
            catalog={[]}
            isPlaying={isPlaying}
            isMuted={isMuted}
            volume={volume}
            pitch={pitch}
            speed={speed}
            roomCode={roomCode}
            onSetRoomCode={(code) => setRoomCode(code.toUpperCase())}
            onAddToQueue={handleAddToQueue}
            onRemoveFromQueue={handleRemoveFromQueue}
            onPrioritize={handlePrioritize}
            onTogglePlay={handleTogglePlay}
            onPlayNext={handlePlayNext}
            onReplay={handleReplay}
            onToggleMute={handleToggleMute}
            onChangePitch={handleChangePitch}
            onChangeSpeed={handleChangeSpeed}
            onSendSfx={handleSendSfx}
            onTriggerScore={() => {
              setIsScoreOpen(true);
              syncEngine.sendCommand({ action: 'score' });
            }}
            onSwitchToTV={() => setMode('tv')}
          />
        )}
      </main>

      {/* MODALS */}
      <TVSearchModal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchInitialQuery('');
          setSearchAutoVoice(false);
        }}
        onSelectSong={handleAddToQueue}
        catalog={[]}
        initialQuery={searchInitialQuery}
        autoVoice={searchAutoVoice}
      />

      <KaraokeScoreModal
        isOpen={isScoreOpen}
        songTitle={lastFinishedSongTitle || currentSong?.title || ''}
        onNext={handlePlayNext}
        onClose={() => setIsScoreOpen(false)}
      />

      <AndroidTVInstallerModal
        isOpen={isInstallerOpen}
        onClose={() => setIsInstallerOpen(false)}
        appUrl={appUrl}
        roomCode={roomCode}
      />
    </div>
  );
}
