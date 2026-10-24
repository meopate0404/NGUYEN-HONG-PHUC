import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Mic2,
  Tv,
  Smartphone,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { KaraokeSong } from './data/karaokeCatalog';
import { TVPlayerView } from './components/TVPlayerView';
import { MobileRemoteView } from './components/MobileRemoteView';
import { TVSearchModal } from './components/TVSearchModal';
import { KaraokeScoreModal } from './components/KaraokeScoreModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { syncEngine, RoomCommand } from './utils/syncEngine';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function App() {
  // Mode: strictly default to TV view ('tv')
  const [mode, setMode] = useState<'tv' | 'mobile'>('tv');
  const [roomCode, setRoomCode] = useState<string>('6868');

  // Playback state - Completely clean initial queue
  const [currentSong, setCurrentSong] = useState<KaraokeSong | null>(null);
  const [queue, setQueue] = useState<KaraokeSong[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(100);
  const [pitch, setPitch] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);

  // Modals & CAPTCHA / Google auth features
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [searchAutoVoice, setSearchAutoVoice] = useState(false);
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [isGoogleAuthOpen, setIsGoogleAuthOpen] = useState(false);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [useDirectIframe, setUseDirectIframe] = useState<boolean>(false);
  const [lastFinishedSongTitle, setLastFinishedSongTitle] = useState('');

  const ytPlayerRef = useRef<any>(null);
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentSongRef = useRef<KaraokeSong | null>(currentSong);
  currentSongRef.current = currentSong;

  const queueRef = useRef<KaraokeSong[]>(queue);
  queueRef.current = queue;

  // App & Mobile URL calculation (safely initialized)
  const [appUrl, setAppUrl] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined' && window.location) {
        return `${window.location.origin || ''}${window.location.pathname || ''}`;
      }
    } catch (e) {}
    return '';
  });
  const [mobileUrl, setMobileUrl] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined' && window.location) {
        return `${window.location.origin || ''}${window.location.pathname || ''}?room=6868&mode=mobile`;
      }
    } catch (e) {}
    return '';
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location) {
        const origin = window.location.origin || '';
        const path = window.location.pathname || '';
        const base = `${origin}${path}`;
        setAppUrl(base);
        setMobileUrl(`${base}?room=${roomCode}&mode=mobile`);

        // Read query params for room and mode
        const params = new URLSearchParams(window.location.search || '');
        const urlRoom = params.get('room');
        const urlMode = params.get('mode');

        if (urlRoom) {
          setRoomCode(urlRoom.toUpperCase());
        }

        // Luôn luôn để app chạy mặc định ở tab 'màn hình tv', chỉ vào mobile khi quét QR (có ?mode=mobile)
        if (urlMode === 'mobile') {
          setMode('mobile');
        } else {
          setMode('tv');
        }
      }
    } catch (e) {
      console.warn('URL parsing error:', e);
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

  // YouTube Player initialization with video ID and iframe fallback
  const initYouTubePlayer = useCallback((videoIdToLoad?: string) => {
    if (typeof window === 'undefined') return;
    const slotContainer = document.getElementById('youtube-player-slot');
    if (!slotContainer) return;

    if (!window.YT || !window.YT.Player) {
      setUseDirectIframe(true);
      return;
    }

    const vid = videoIdToLoad || (currentSongRef.current ? currentSongRef.current.id : '');
    if (!vid) return;

    // If player already exists and is healthy, just load video directly without rebuilding DOM
    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById({
          videoId: vid,
          suggestedQuality: 'hd1080',
        });
        ytPlayerRef.current.playVideo();
        setUseDirectIframe(false);
        setIsPlaying(true);
        return;
      } catch (e) {
        console.warn('loadVideoById failed, recreating player:', e);
      }
    }

    try {
      // Re-create the inner target div without disturbing React's virtual DOM
      slotContainer.innerHTML = '<div id="youtube-player" style="width:100%;height:100%;"></div>';

      ytPlayerRef.current = new window.YT.Player('youtube-player', {
        host: 'https://www.youtube.com',
        height: '100%',
        width: '100%',
        videoId: vid,
        playerVars: {
          origin: typeof window !== 'undefined' ? window.location.origin : '',
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          cc_load_policy: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          hl: 'vi',
        },
        events: {
          onReady: (event: any) => {
            setUseDirectIframe(false);
            try {
              event.target.setPlaybackQuality('hd1080');
              if (event.target.unloadModule) {
                event.target.unloadModule('captions');
                event.target.unloadModule('cc');
              }
            } catch (e) {}
            event.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (event: any) => {
            if (event.data === 0) {
              const finishedTitle = currentSongRef.current?.title || 'Bài hát Karaoke';
              setLastFinishedSongTitle(finishedTitle);
              setIsScoreOpen(true);
            } else if (event.data === 1) {
              setIsPlaying(true);
            } else if (event.data === 2) {
              setIsPlaying(false);
            }
          },
          onError: (err: any) => {
            console.warn('YT Player error, falling back to direct iframe:', err);
            setUseDirectIframe(true);
          },
        },
      });
    } catch (err) {
      console.error('Error creating YouTube player, falling back to direct iframe:', err);
      setUseDirectIframe(true);
    }
  }, []);

  // Play video with forced 1080p resolution and subtitles disabled
  const playVideoWith1080p = useCallback(
    (videoId: string) => {
      if (!videoId) return;
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(true);

      // Try YouTube IFrame API if ready
      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        try {
          ytPlayerRef.current.loadVideoById({
            videoId,
            suggestedQuality: 'hd1080',
          });
          ytPlayerRef.current.playVideo();
          setUseDirectIframe(false);
          return;
        } catch (e) {
          console.warn('loadVideoById failed, re-initializing player', e);
        }
      }

      // Re-initialize player with the videoId
      if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
        initYouTubePlayer(videoId);
      } else {
        // Direct fallback
        setUseDirectIframe(true);
      }
    },
    [initYouTubePlayer]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.YT && window.YT.Player) {
        if (currentSongRef.current) {
          initYouTubePlayer(currentSongRef.current.id);
        }
      } else {
        const prevReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prevReady) {
            try {
              prevReady();
            } catch (e) {}
          }
          if (currentSongRef.current) {
            initYouTubePlayer(currentSongRef.current.id);
          }
        };
      }
    }
  }, [initYouTubePlayer]);

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
      {/* VIEW CONTAINER - STRICTLY DEFAULT TO TV PLAYER VIEW */}
      <main className="flex-1 flex overflow-hidden">
        {mode === 'mobile' ? (
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
        ) : (
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
            onTriggerScore={() => setIsScoreOpen(true)}
            onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
            isInteractiveMode={isInteractiveMode}
            onToggleInteractiveMode={() => setIsInteractiveMode((prev) => !prev)}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            useDirectIframe={useDirectIframe}
            onSelectSong={handleAddToQueue}
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

      <GoogleAuthModal
        isOpen={isGoogleAuthOpen}
        onClose={() => setIsGoogleAuthOpen(false)}
        isInteractiveMode={isInteractiveMode}
        onToggleInteractiveMode={() => setIsInteractiveMode((prev) => !prev)}
      />
    </div>
  );
}
