import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Mic,
  ListMusic,
  Sliders,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sparkles,
  Tv,
  Plus,
  Trash2,
  ArrowUp,
  Award,
  Music,
  Check,
  Loader2,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { KaraokeSong } from '../data/karaokeCatalog';
import { sfx } from '../utils/audioEffects';

interface Props {
  currentSong: KaraokeSong | null;
  queue: KaraokeSong[];
  catalog: KaraokeSong[];
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  pitch: number;
  speed: number;
  roomCode: string;
  onSetRoomCode: (code: string) => void;
  onAddToQueue: (song: KaraokeSong, playNow: boolean) => void;
  onRemoveFromQueue: (index: number) => void;
  onPrioritize: (index: number) => void;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onReplay: () => void;
  onToggleMute: () => void;
  onChangePitch: (delta: number) => void;
  onChangeSpeed: (delta: number) => void;
  onSendSfx: (type: string) => void;
  onTriggerScore: () => void;
  onSwitchToTV: () => void;
}

export const MobileRemoteView: React.FC<Props> = ({
  currentSong,
  queue,
  catalog,
  isPlaying,
  isMuted,
  volume,
  pitch,
  speed,
  roomCode,
  onSetRoomCode,
  onAddToQueue,
  onRemoveFromQueue,
  onPrioritize,
  onTogglePlay,
  onPlayNext,
  onReplay,
  onToggleMute,
  onChangePitch,
  onChangeSpeed,
  onSendSfx,
  onTriggerScore,
  onSwitchToTV,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'queue' | 'sfx'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Tất cả');
  const [isListening, setIsListening] = useState(false);
  const [showRoomEdit, setShowRoomEdit] = useState(false);
  const [tempRoomInput, setTempRoomInput] = useState(roomCode);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Live YouTube search states
  const [ytResults, setYtResults] = useState<KaraokeSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchDebounceRef = useRef<any>(null);

  const genres = [
    { label: 'Tất cả', query: '' },
    { label: 'Bolero', query: 'karaoke bolero tru tinh' },
    { label: 'Nhạc Trẻ', query: 'karaoke nhac tre hot' },
    { label: 'Remix', query: 'karaoke remix soi dong' },
    { label: 'Song Ca', query: 'karaoke song ca nam nu' },
    { label: 'Tone Nam', query: 'karaoke tone nam' },
    { label: 'Tone Nữ', query: 'karaoke tone nu' },
    { label: 'Quê Hương', query: 'karaoke que huong dat nuoc' },
  ];

  const showToast = (msg: string) => {
    setAddedToast(msg);
    setTimeout(() => setAddedToast(null), 2000);
  };

  // Subtle haptic vibration helper for tactile remote feedback
  const triggerHaptic = (pattern: number | number[] = 25) => {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Non-blocking fallback for browsers without vibration support
    }
  };

  // Perform Live YouTube Search directly
  const searchYouTube = async (queryText: string) => {
    if (!queryText.trim()) {
      setYtResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(queryText)}`);
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        setYtResults(data.results);
      } else {
        setYtResults([]);
      }
    } catch (err) {
      console.error('YouTube search error:', err);
      setYtResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch YouTube autocomplete suggestions
  const fetchSuggestions = async (val: string) => {
    if (!val || val.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/youtube/suggest?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (data && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions.slice(0, 5));
      }
    } catch {
      // Ignore
    }
  };

  const handleInputChange = (val: string) => {
    setSearchQuery(val);
    setShowSuggestions(true);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    fetchSuggestions(val);

    searchDebounceRef.current = setTimeout(() => {
      searchYouTube(val);
    }, 500);
  };

  const handleSelectSuggestion = (sug: string) => {
    triggerHaptic(20);
    setSearchQuery(sug);
    setShowSuggestions(false);
    searchYouTube(sug);
  };

  const handleGenreClick = (genre: { label: string; query: string }) => {
    triggerHaptic(15);
    setSelectedGenre(genre.label);
    if (!genre.query) {
      setSearchQuery('');
      setYtResults([]);
    } else {
      setSearchQuery(genre.label);
      searchYouTube(genre.query);
    }
  };

  // Voice Search via Web Speech API
  const handleVoiceSearch = () => {
    triggerHaptic(30);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt không hỗ trợ nhận diện giọng nói trên thiết bị này.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;
      setIsListening(true);

      recognition.onresult = (event: any) => {
        triggerHaptic([25, 40]);
        const text = event.results[0][0].transcript;
        setSearchQuery(text);
        setIsListening(false);
        showToast(`Đang tìm YouTube: "${text}"`);
        searchYouTube(text);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f0f] text-white min-h-0 relative select-none">
      {/* Toast Alert */}
      {addedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-1.5 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* MOBILE TOP STATUS & NO-LOGIN BADGE */}
      <div className="bg-[#18181b] border-b border-neutral-800 px-3 py-2 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-neutral-300 font-medium text-[11px]">Đang nối TV:</span>
          {showRoomEdit ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempRoomInput}
                onChange={(e) => setTempRoomInput(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded text-white font-mono w-20 text-xs font-bold"
              />
              <button
                onClick={() => {
                  onSetRoomCode(tempRoomInput);
                  setShowRoomEdit(false);
                }}
                className="px-2 py-0.5 bg-red-600 text-white rounded font-bold text-[10px]"
              >
                Lưu
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowRoomEdit(true)}
              className="font-mono font-extrabold text-amber-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700 flex items-center gap-1"
            >
              #{roomCode} ✏️
            </button>
          )}
        </div>

        {/* Free / No Login Required Tag */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 rounded text-[10px] font-bold">
            ✓ Không cần Login
          </span>
          <button
            onClick={onSwitchToTV}
            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 border border-neutral-700"
          >
            <Tv className="w-3 h-3 text-red-400" />
            <span>Màn TV</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR (STICKY) WITH DIRECT YOUTUBE SEARCH */}
      <div className="bg-[#141416] p-3 border-b border-neutral-800 shrink-0 space-y-2 relative">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-neutral-900 border border-neutral-700 focus-within:border-red-500 rounded-full px-3 py-2 flex items-center gap-2 transition">
            <Search className="w-4 h-4 text-red-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false);
                  searchYouTube(searchQuery);
                }
              }}
              placeholder="Tìm kiếm mọi bài hát trên YouTube..."
              className="bg-transparent text-white text-xs w-full focus:outline-none placeholder:text-neutral-500"
            />
            {isLoading && <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />}
            {searchQuery && !isLoading && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setYtResults([]);
                  setShowSuggestions(false);
                }}
                className="text-neutral-400 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Voice Search Button */}
          <button
            onClick={handleVoiceSearch}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition shrink-0 ${
              isListening
                ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/50'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
            }`}
            title="Tìm kiếm bằng giọng nói"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Autocomplete suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-14 left-3 right-16 bg-[#1f1f23] border border-neutral-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-neutral-800">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSelectSuggestion(sug)}
                className="w-full text-left px-3.5 py-2 text-xs text-neutral-200 hover:bg-neutral-800 flex items-center gap-2"
              >
                <Search className="w-3 h-3 text-neutral-500" />
                <span className="truncate">{sug}</span>
              </button>
            ))}
          </div>
        )}

        {/* Genre Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {genres.map((g) => (
            <button
              key={g.label}
              onClick={() => handleGenreClick(g)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition font-medium text-[11px] ${
                selectedGenre === g.label
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/60'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABS SWITCHER */}
      <div className="flex bg-[#18181b] border-b border-neutral-800 text-xs shrink-0">
        <button
          onClick={() => {
            triggerHaptic(20);
            setActiveTab('search');
          }}
          className={`flex-1 py-2.5 text-center font-bold border-b-2 flex items-center justify-center gap-1.5 transition ${
            activeTab === 'search'
              ? 'border-red-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-red-500" />
          <span>YouTube ({ytResults.length})</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(20);
            setActiveTab('queue');
          }}
          className={`flex-1 py-2.5 text-center font-bold border-b-2 flex items-center justify-center gap-1.5 transition relative ${
            activeTab === 'queue'
              ? 'border-red-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5 text-amber-400" />
          <span>Hàng Chờ ({queue.length})</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(20);
            setActiveTab('sfx');
          }}
          className={`flex-1 py-2.5 text-center font-bold border-b-2 flex items-center justify-center gap-1.5 transition ${
            activeTab === 'sfx'
              ? 'border-red-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Cổ Vũ & SFX</span>
        </button>
      </div>

      {/* TAB CONTENT (SCROLLABLE, PADDED FOR FLOATING CONTROLLER) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 pb-44">
        {/* TAB 1: YOUTUBE SEARCH RESULTS */}
        {activeTab === 'search' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 text-[11px] text-neutral-400">
              <span>Nguồn: YouTube Karaoke Live</span>
              {isLoading && (
                <span className="text-red-400 flex items-center gap-1 font-semibold">
                  <Loader2 className="w-3 h-3 animate-spin" /> Đang tải YouTube...
                </span>
              )}
            </div>

            {ytResults.length === 0 ? (
              <div className="text-center py-12 px-4 text-neutral-400 text-xs flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-red-600/10 border border-red-500/30 flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-sm font-bold text-white mb-1">Tìm Kiếm Mọi Bài Hát Trên YouTube</div>
                <p className="text-neutral-500 max-w-xs leading-relaxed text-[11px]">
                  Nhập tên bài hát ở ô trên hoặc bấm biểu tượng Micro để tìm kiếm trực tiếp trên YouTube!
                </p>
              </div>
            ) : (
              ytResults.map((song) => (
                <div
                  key={song.id}
                  className="bg-[#18181b] border border-neutral-800 p-2.5 rounded-xl flex gap-3 items-center group transition hover:border-neutral-700"
                >
                  <div className="relative shrink-0">
                    <img
                      src={song.thumb}
                      alt={song.title}
                      className="w-20 h-14 object-cover rounded-lg border border-neutral-700"
                    />
                    {song.duration && (
                      <span className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[9px] font-mono text-white">
                        {song.duration}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                      {song.title}
                    </h4>
                    <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1.5 truncate">
                      <span>{song.artist}</span>
                      {song.views && (
                        <>
                          <span>•</span>
                          <span>{song.views}</span>
                        </>
                      )}
                    </div>
                    {song.tone && (
                      <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 bg-red-950 text-red-300 rounded border border-red-800 font-medium">
                        {song.tone}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        triggerHaptic(35);
                        onAddToQueue(song, true);
                        showToast(`Đang ưu tiên hát: "${song.title}"`);
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow transition active:scale-95"
                    >
                      Hát ngay
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic(25);
                        onAddToQueue(song, false);
                        showToast(`Đã thêm vào hàng chờ: "${song.title}"`);
                      }}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-[11px] rounded-lg border border-neutral-700 transition active:scale-95"
                    >
                      + Hàng chờ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: QUEUE */}
        {activeTab === 'queue' && (
          <div className="space-y-2">
            {/* Now playing banner */}
            {currentSong && (
              <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl flex items-center gap-3">
                <img
                  src={currentSong.thumb}
                  alt={currentSong.title}
                  className="w-14 h-10 object-cover rounded border border-red-600 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-bold text-red-400 tracking-wider">
                    Đang phát trên TV
                  </span>
                  <div className="text-xs font-bold text-white truncate">{currentSong.title}</div>
                  <div className="text-[10px] text-neutral-400">{currentSong.artist}</div>
                </div>
              </div>
            )}

            <div className="text-xs font-bold text-neutral-400 px-1 pt-1 flex justify-between items-center">
              <span>Danh Sách Chờ ({queue.length} bài)</span>
              {queue.length > 0 && (
                <span className="text-[10px] text-neutral-500">Tự động chuyển bài khi hết</span>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs">
                Chưa có bài hát trong hàng chờ. Hãy gõ tên bài hát ở tab YouTube để thêm nhé!
              </div>
            ) : (
              queue.map((song, idx) => (
                <div
                  key={`${song.id}-${idx}`}
                  className="bg-[#18181b] border border-neutral-800 p-2.5 rounded-xl flex gap-2.5 items-center"
                >
                  <span className="w-5 text-center font-bold text-xs text-neutral-400">
                    #{idx + 1}
                  </span>
                  <img
                    src={song.thumb}
                    alt={song.title}
                    className="w-14 h-10 object-cover rounded shrink-0 border border-neutral-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{song.title}</div>
                    <div className="text-[10px] text-neutral-400">{song.artist} • {song.duration}</div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {idx > 0 && (
                      <button
                        onClick={() => {
                          triggerHaptic(30);
                          onPrioritize(idx);
                        }}
                        title="Đẩy lên đầu hàng chờ"
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-lg text-xs active:scale-90 transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        triggerHaptic(25);
                        onRemoveFromQueue(idx);
                      }}
                      title="Xóa bài"
                      className="p-1.5 bg-neutral-800 hover:bg-red-600/30 text-red-400 rounded-lg text-xs active:scale-90 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: SFX & CỔ VŨ */}
        {activeTab === 'sfx' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300">
              💡 Bấm các nút dưới đây để phát hiệu ứng âm thanh tức thì trên loa của Tivi!
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  triggerHaptic([30, 40, 30]);
                  sfx.playApplause(2.5);
                  onSendSfx('applause');
                  showToast('Đã phát tiếng vỗ tay lên TV! 👏');
                }}
                className="p-4 bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition"
              >
                <span className="text-3xl">👏</span>
                <span className="font-bold text-xs text-white">Vỗ Tay Hoan Hô</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic([35, 45, 35]);
                  sfx.playAirHorn();
                  onSendSfx('airhorn');
                  showToast('Đã hú còi cực bốc lên TV! 📢');
                }}
                className="p-4 bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition"
              >
                <span className="text-3xl">📢</span>
                <span className="font-bold text-xs text-white">Còi Hú Remix</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(35);
                  sfx.playWhistle();
                  onSendSfx('whistle');
                  showToast('Đã huýt sáo cổ vũ lên TV! 🎺');
                }}
                className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition"
              >
                <span className="text-3xl">🎺</span>
                <span className="font-bold text-xs text-white">Huýt Sáo Cổ Vũ</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(30);
                  sfx.playChime();
                  onSendSfx('chime');
                  showToast('Đã gõ chuông chúc mừng! 🔔');
                }}
                className="p-4 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition"
              >
                <span className="text-3xl">🔔</span>
                <span className="font-bold text-xs text-white">Chuông Keng Keng</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  triggerHaptic([40, 50, 40, 50, 60]);
                  onTriggerScore();
                  showToast('Đang mở màn hình chấm điểm pháo hoa trên TV! 🏆');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-red-500 hover:opacity-95 text-black font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm uppercase tracking-wide active:scale-95 transition"
              >
                <Award className="w-5 h-5 text-black" />
                <span>Chấm Điểm & Bắn Pháo Hoa Trên TV</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING DOCKED BOTTOM CONTROLLER */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#161619] border-t border-neutral-800 p-3 flex flex-col gap-2 z-40 shadow-2xl">
        {/* Quick cheer row */}
        <div className="flex items-center justify-between px-2 text-xs">
          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Remote đang kết nối TV</span>
          </div>
          <button
            onClick={() => {
              triggerHaptic(25);
              sfx.playApplause(2);
              onSendSfx('applause');
            }}
            className="px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/50 rounded-full text-xs font-bold flex items-center gap-1.5 active:scale-95 transition"
          >
            👏 Vỗ tay TV
          </button>
        </div>

        {/* Main playback buttons */}
        <div className="flex items-center justify-between px-2 pt-0.5">
          <button
            onClick={() => {
              triggerHaptic(25);
              onReplay();
            }}
            title="Hát lại từ đầu"
            className="w-11 h-11 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white border border-neutral-700 active:scale-90 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              triggerHaptic(30);
              onTogglePlay();
            }}
            title="Phát / Tạm dừng"
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-900/60 active:scale-95 transition"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
          </button>

          <button
            onClick={() => {
              triggerHaptic([25, 40, 25]);
              onPlayNext();
            }}
            title="Qua bài kế tiếp"
            className="w-11 h-11 rounded-full bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white flex items-center justify-center border border-red-500/40 active:scale-90 transition"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              triggerHaptic(20);
              onToggleMute();
            }}
            title="Tắt tiếng / Bật tiếng"
            className="w-11 h-11 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white border border-neutral-700 active:scale-90 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
