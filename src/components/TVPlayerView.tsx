import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Search,
  Mic,
  ListMusic,
  QrCode as QrCodeIcon,
  Maximize2,
  Minimize2,
  Sparkles,
  Music,
  Mic2,
  Award,
} from 'lucide-react';
import { KaraokeSong } from '../data/karaokeCatalog';

interface Props {
  currentSong: KaraokeSong | null;
  queue: KaraokeSong[];
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  pitch: number;
  speed: number;
  roomCode: string;
  mobileUrl: string;
  onPlayNext: () => void;
  onTogglePlay: () => void;
  onReplay: () => void;
  onToggleMute: () => void;
  onRemoveFromQueue: (index: number) => void;
  onPrioritize: (index: number) => void;
  onOpenSearch: (initialQuery?: string, autoVoice?: boolean) => void;
  onTriggerScore: () => void;
  currentTime?: number;
  duration?: number;
  onSeek?: (seconds: number) => void;
  useDirectIframe?: boolean;
  onSelectSong?: (song: KaraokeSong, playNow: boolean) => void;
}

const formatTime = (sec: number): string => {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const TVPlayerView: React.FC<Props> = ({
  currentSong,
  queue,
  isPlaying,
  isMuted,
  volume,
  pitch,
  speed,
  roomCode,
  mobileUrl,
  onPlayNext,
  onTogglePlay,
  onReplay,
  onToggleMute,
  onRemoveFromQueue,
  onPrioritize,
  onOpenSearch,
  onTriggerScore,
  currentTime = 0,
  duration = 0,
  onSeek,
  useDirectIframe = false,
  onSelectSong,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Voice Search via Web Speech API (TV Remote microphone support)
  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onOpenSearch('', true);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsVoiceListening(true);
        setVoiceTranscript('Đang lắng nghe từ Micro Remote TV... Hãy nói tên bài hát');
      };

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalTranscript = event.results[i][0].transcript.trim();
            setIsVoiceListening(false);
            setVoiceTranscript('');
            onOpenSearch(finalTranscript, false);
            return;
          } else {
            setVoiceTranscript(event.results[i][0].transcript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('TV voice recognition error:', event.error);
        setIsVoiceListening(false);
        setVoiceTranscript('');
        if (event.error !== 'aborted') {
          onOpenSearch('', false);
        }
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting TV voice search:', err);
      setIsVoiceListening(false);
      onOpenSearch('', true);
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsVoiceListening(false);
    setVoiceTranscript('');
  };

  useEffect(() => {
    // Ensure target URL is non-empty before generating QR code
    const targetUrl =
      mobileUrl?.trim() ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}?room=${roomCode}&mode=mobile`
        : '');

    if (!targetUrl) return;

    // Generate high resolution, crisp QR code for easy scanning
    QRCode.toDataURL(targetUrl, {
      width: 360,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [mobileUrl, roomCode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0c] text-white relative">
      {/* FLOATING VOICE LISTENING OVERLAY FOR TV */}
      {isVoiceListening && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/95 border-2 border-red-500 rounded-2xl p-4 shadow-2xl flex items-center gap-4 max-w-lg w-full backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center animate-pulse shrink-0">
            <Mic className="w-6 h-6 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Đang lắng nghe từ Micro Remote TV...
            </div>
            <p className="text-sm font-bold text-white mt-0.5 truncate">
              {voiceTranscript || 'Hãy nói tên bài hát (Ví dụ: "Hoa Nở Không Màu", "Cắt Đôi Nỗi Sầu")...'}
            </p>
          </div>
          <button
            onClick={stopVoiceSearch}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-bold border border-neutral-700 shrink-0"
          >
            Hủy
          </button>
        </div>
      )}

      {/* PROMINENT, EASY-TO-SEE SEARCH BAR WITH VOICE SUPPORT */}
      <div className="px-3 pt-2.5 pb-1 flex items-center gap-2.5 shrink-0">
        <div
          onClick={() => onOpenSearch()}
          className="flex-1 bg-[#161619] hover:bg-[#1f1f24] border-2 border-red-600/70 hover:border-red-500 rounded-2xl px-4 py-2 flex items-center justify-between cursor-pointer transition shadow-lg group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500 group-hover:scale-105 transition shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-sm font-bold text-white group-hover:text-red-300 transition">
                Tìm kiếm bài hát trên YouTube...
              </span>
              <span className="hidden md:inline ml-2 text-xs text-neutral-400">
                (Bấm hoặc nhấn F trên Remote để tìm nhanh)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block px-2.5 py-1 bg-red-600 group-hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition">
              Tìm Bài
            </span>
          </div>
        </div>

        {/* VOICE SEARCH BUTTON FOR TV REMOTE */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenSearch('', true);
          }}
          className="px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition shadow shrink-0 border bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white border-red-600/50"
          title="Tìm kiếm bằng giọng nói qua Micro Remote TV hoặc tai nghe"
        >
          <Mic className="w-4 h-4 text-red-400" />
          <span className="hidden sm:inline font-bold">Nói tìm bài</span>
        </button>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTriggerScore}
            title="Chấm điểm Karaoke"
            className="px-3 py-2.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black rounded-xl text-xs font-bold border border-amber-500/40 transition flex items-center gap-1.5 shadow"
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Chấm điểm</span>
          </button>
          <button
            onClick={toggleFullscreen}
            title="Toàn màn hình TV"
            className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl border border-neutral-700 transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MAIN SCREEN: SCALED-UP VIDEO PLAYER + 1/2 COMPACT QUEUE */}
      <div className="flex-1 flex flex-row p-2.5 gap-2.5 min-h-0 overflow-hidden">
        {/* SCALED-UP VIDEO PLAYER VIEW (Takes maximal space) */}
        <div className="flex-1 bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl relative flex items-center justify-center group">
          {/* YouTube Player Container */}
          <div className="relative w-full h-full aspect-video flex items-center justify-center">
            {/* Persistent unmanaged slot for YouTube IFrame API to prevent React removeChild crashes */}
            <div
              id="youtube-player-slot"
              className={`w-full h-full rounded-2xl overflow-hidden ${
                useDirectIframe && currentSong ? 'hidden' : 'block'
              }`}
            ></div>

            {/* Direct fallback iframe when activated (using youtube-nocookie for ad-free clean playback) */}
            {useDirectIframe && currentSong && (
              <iframe
                key={currentSong.id}
                id="youtube-direct-player"
                src={`https://www.youtube-nocookie.com/embed/${currentSong.id}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.origin : ''
                )}&hl=vi&rel=0&modestbranding=1&controls=0&iv_load_policy=3&playsinline=1`}
                title={currentSong.title}
                className="w-full h-full border-0 rounded-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; microphone"
                allowFullScreen
              />
            )}

            {/* Click to resume badge if autoplay was blocked */}
            {currentSong && !isPlaying && (
              <button
                onClick={onTogglePlay}
                className="absolute top-4 right-4 z-20 px-3.5 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-xl border border-red-400 flex items-center gap-1.5 backdrop-blur-sm transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Bấm để tiếp tục phát</span>
              </button>
            )}
          </div>

          {/* Placeholder when idle */}
          {!currentSong && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#181014] to-[#0a0a0c] p-6 text-center z-20">
              <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mb-3 animate-pulse">
                <Mic2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-white mb-1.5">
                SẴN SÀNG HÁT KARAOKE
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm max-w-md mb-4">
                Tìm kiếm bài hát trực tiếp từ YouTube, nói vào Micro Remote TV hoặc dùng Điện thoại quét mã QR:
              </p>
              <div className="flex flex-wrap justify-center gap-2.5 mb-5">
                <button
                  onClick={() => onOpenSearch()}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/50 flex items-center gap-2 text-xs sm:text-sm transition"
                >
                  <Search className="w-4 h-4" />
                  <span>Tìm Kiếm Bài Hát</span>
                </button>
                <button
                  onClick={() => onOpenSearch('', true)}
                  className="px-4 py-2.5 bg-red-950/60 hover:bg-red-900 text-red-300 font-bold rounded-xl border border-red-600/60 flex items-center gap-2 text-xs sm:text-sm transition"
                >
                  <Mic className="w-4 h-4 text-red-400" />
                  <span>Nói Tìm Bài Bằng Mic</span>
                </button>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl border border-neutral-700 flex items-center gap-2 text-xs sm:text-sm transition"
                >
                  <QrCodeIcon className="w-4 h-4 text-blue-400" />
                  <span>Quét QR Điện Thoại</span>
                </button>
              </div>

              {/* Quick live YouTube search topics */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
                <span className="text-[11px] text-neutral-400 font-bold mr-1">Tìm nhanh trên YouTube:</span>
                {[
                  { label: 'Nhạc Trẻ Mới', query: 'karaoke nhac tre hot' },
                  { label: 'Bolero Trữ Tình', query: 'karaoke bolero tru tinh' },
                  { label: 'Remix Sôi Động', query: 'karaoke remix bốc lửa' },
                  { label: 'Tone Nam', query: 'karaoke tone nam' },
                  { label: 'Tone Nữ', query: 'karaoke tone nu' },
                  { label: 'Song Ca', query: 'karaoke song ca nam nu' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => onOpenSearch(item.query)}
                    className="px-3 py-1.5 bg-neutral-900/90 hover:bg-red-600/30 border border-neutral-700/80 hover:border-red-500 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white transition flex items-center gap-1.5 shadow"
                  >
                    <Search className="w-3 h-3 text-red-500" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* QUEUE PANEL (Shrunk by 50% to scale up main screen, preserving thumbnail, slow marquee, channel, and action buttons) */}
        <div className="w-40 sm:w-44 md:w-48 lg:w-52 xl:w-56 bg-[#141417] rounded-2xl border border-neutral-800 flex flex-col overflow-hidden shrink-0 shadow-xl">
          {/* Queue Header */}
          <div className="p-2 sm:p-2.5 bg-neutral-900/95 border-b border-neutral-800 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <ListMusic className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <h3 className="font-bold text-[11px] sm:text-xs text-white truncate">
                Chờ <span className="text-red-400">({queue.length})</span>
              </h3>
            </div>
            <button
              onClick={() => onOpenSearch()}
              className="text-[10px] px-2 py-0.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-md font-bold transition flex items-center gap-0.5 border border-red-500/30 shrink-0"
              title="Tìm thêm bài hát từ YouTube"
            >
              + Thêm
            </button>
          </div>

          {/* Queue List with YouTube Thumbnails and Slow Marquee Titles */}
          <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1.5">
            {queue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-3 text-center text-neutral-500">
                <ListMusic className="w-8 h-8 mb-1.5 stroke-[1.5] opacity-40 text-neutral-400" />
                <p className="text-[11px] font-semibold text-neutral-400 leading-tight">Chưa có bài chờ</p>
                <p className="text-[9px] text-neutral-500 mt-0.5 max-w-[150px]">
                  Bấm tìm kiếm ở trên hoặc dùng remote nói
                </p>
                <button
                  onClick={() => onOpenSearch()}
                  className="mt-2.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-bold rounded-md border border-neutral-700 transition"
                >
                  Tìm bài ngay
                </button>
              </div>
            ) : (
              queue.map((song, idx) => (
                <div
                  key={`${song.id}-${idx}`}
                  className="p-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800/90 hover:border-neutral-700 flex items-center gap-1.5 group transition shadow-sm"
                >
                  {/* Song Order Number */}
                  <span className="w-3.5 text-center font-bold text-[10px] text-neutral-400 group-hover:text-red-400 shrink-0">
                    #{idx + 1}
                  </span>

                  {/* YouTube Thumbnail Preview */}
                  <div className="relative w-12 h-8 sm:w-13 sm:h-8 rounded-md overflow-hidden bg-neutral-950 shrink-0 border border-neutral-800 group-hover:border-neutral-600 transition">
                    <img
                      src={song.thumb || `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`}
                      alt={song.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${song.id}/hqdefault.jpg`;
                      }}
                    />
                    {song.duration && (
                      <span className="absolute bottom-0 right-0 px-0.5 bg-black/85 text-[8px] font-mono text-neutral-200 rounded-tl">
                        {song.duration}
                      </span>
                    )}
                  </div>

                  {/* Middle: Title with Slow Marquee + Channel/Artist */}
                  <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center">
                    <div className="overflow-hidden whitespace-nowrap w-full">
                      <div
                        title={song.title}
                        className="animate-marquee hover:[animation-play-state:paused] text-[11px] font-bold text-white group-hover:text-red-400 cursor-pointer"
                      >
                        {song.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-neutral-400 truncate mt-0.5">
                      <span className="truncate">{song.artist || 'Karaoke'}</span>
                      {song.genre && (
                        <span className="px-1 py-0.2 rounded bg-neutral-800 text-[8px] text-amber-300 shrink-0 font-medium">
                          {song.genre}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons: Prioritize and Delete */}
                  <div className="flex flex-col gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition">
                    {idx > 0 && (
                      <button
                        onClick={() => onPrioritize(idx)}
                        title="Ưu tiên hát trước"
                        className="w-4 h-4 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black text-[9px] font-bold transition flex items-center justify-center border border-amber-500/30"
                      >
                        ⬆
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveFromQueue(idx)}
                      title="Xóa khỏi hàng chờ"
                      className="w-4 h-4 rounded bg-neutral-800 hover:bg-red-600 text-neutral-400 hover:text-white text-[9px] font-bold transition flex items-center justify-center border border-neutral-700 hover:border-red-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CUSTOM KARAOKE PROGRESS TIMELINE (Replaces cluttered YouTube bottom bar) */}
      {currentSong && (
        <div
          className="w-full bg-neutral-900 h-2 hover:h-3 transition-all cursor-pointer relative group/progress z-20 border-t border-neutral-800"
          onClick={(e) => {
            if (!duration || !onSeek) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            onSeek(pos * duration);
          }}
          title="Nhấp để tua nhanh / lùi bài hát"
        >
          <div
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-r relative transition-[width] duration-150"
            style={{ width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-red-600 opacity-0 group-hover/progress:opacity-100 transition"></div>
          </div>
        </div>
      )}

      {/* TV BOTTOM STATUS & CONTROL BAR */}
      <div className="bg-[#141417] border-t border-neutral-800 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-xl">
        {/* Now Playing Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div
              className={`w-11 h-11 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 border-2 border-red-500 flex items-center justify-center overflow-hidden shadow-md ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/20"></div>
            </div>
            {isPlaying && (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#141417] flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded bg-red-600/30 border border-red-600 text-red-300">
                {isPlaying ? 'ĐANG PHÁT' : 'TẠM DỪNG'}
              </span>
              {currentSong?.genre && (
                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                  {currentSong.genre}
                </span>
              )}
            </div>
            {/* Now playing title with Marquee if long */}
            <div className="overflow-hidden whitespace-nowrap mt-0.5">
              <div className="text-sm font-bold text-white truncate">
                {currentSong ? currentSong.title : 'Chưa chọn bài hát...'}
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 truncate">
              {currentSong
                ? `${currentSong.artist} • ${currentSong.duration}`
                : 'Quét mã QR bên phải hoặc dùng thanh tìm kiếm để chọn bài'}
            </p>
          </div>
        </div>

        {/* Playback Controls with Time Display */}
        <div className="flex items-center gap-1.5 shrink-0">
          {currentSong && duration > 0 && (
            <div className="hidden sm:flex items-center text-xs font-mono font-bold text-neutral-300 bg-neutral-900/90 px-2.5 py-1.5 rounded-xl border border-neutral-700/80 mr-1">
              <span className="text-white">{formatTime(currentTime)}</span>
              <span className="text-neutral-500 mx-1">/</span>
              <span className="text-neutral-400">{formatTime(duration)}</span>
            </div>
          )}
          <button
            onClick={onReplay}
            title="Hát lại từ đầu (R)"
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl border border-neutral-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePlay}
            title="Phát / Tạm dừng (Space)"
            className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-900/50 transition active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
          <button
            onClick={onPlayNext}
            title="Qua bài kế tiếp (N)"
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl border border-neutral-700 transition"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleMute}
            title="Tắt tiếng / Bật tiếng"
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl border border-neutral-700 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* SCALED-UP QR CODE (Only QR code, enlarged, no text) */}
        <div
          onClick={() => setShowQrModal(true)}
          className="bg-neutral-900/90 hover:bg-neutral-800 p-1.5 rounded-2xl border border-neutral-700/80 cursor-pointer transition hover:border-red-500 group shadow-xl shrink-0 flex items-center justify-center active:scale-95"
          title="Phóng to mã QR"
        >
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="w-24 h-24 rounded-xl bg-white p-1 shrink-0 shadow-md transition-transform group-hover:scale-105"
            />
          )}
        </div>
      </div>

      {/* BIG QR MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#18181b] border-2 border-red-500/80 w-full max-w-sm rounded-3xl p-6 text-center shadow-[0_0_80px_rgba(239,68,68,0.35)] flex flex-col items-center">
            {/* Header: "Quét QR để chọn nhạc" */}
            <div className="w-full flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <QrCodeIcon className="w-5 h-5 text-red-500" />
                <h3 className="font-extrabold text-lg text-white">Quét QR để chọn nhạc</h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Scaled-up Large QR Code */}
            <div className="bg-white p-4 rounded-2xl inline-block my-2 shadow-2xl">
              {qrDataUrl && <img src={qrDataUrl} alt="Room QR" className="w-64 h-64 sm:w-72 sm:h-72 object-contain" />}
            </div>

            {/* Red Action Button */}
            <button
              onClick={() => setShowQrModal(false)}
              className="mt-5 w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-red-900/50"
            >
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
