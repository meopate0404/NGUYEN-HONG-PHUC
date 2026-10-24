import React, { useState, useRef, useEffect } from 'react';
import { Search, Delete, Space, Mic, X, Music2, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { KaraokeSong } from '../data/karaokeCatalog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectSong: (song: KaraokeSong, playNow: boolean) => void;
  catalog: KaraokeSong[];
  initialQuery?: string;
  autoVoice?: boolean;
}

const KEYS = [
  ['A', 'B', 'C', 'D', 'E', 'F', '1', '2', '3'],
  ['G', 'H', 'I', 'J', 'K', 'L', '4', '5', '6'],
  ['M', 'N', 'O', 'P', 'Q', 'R', '7', '8', '9'],
  ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0'],
];

const SUGGESTIONS = [
  'Hoa Nở Không Màu',
  'Cắt Đôi Nỗi Sầu',
  'Duyên Phận Bolero',
  'Ai Chung Tình Được Mãi',
  'Karaoke Tone Nam',
  'Karaoke Tone Nữ',
  'Karaoke Remix Bốc Lửa',
];

export const TVSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectSong,
  catalog,
  initialQuery = '',
  autoVoice = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [customYoutubeId, setCustomYoutubeId] = useState('');
  const [results, setResults] = useState<KaraokeSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  const performSearch = async (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const searchQuery = trimmed.toLowerCase().includes('karaoke') 
        ? trimmed 
        : `${trimmed} karaoke`;

      const res = await fetch(
        `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(searchQuery)}&filter=all`
      );
      
      if (!res.ok) throw new Error('Network response was not ok');

      const data = await res.json();

      if (data && Array.isArray(data.items)) {
        const formatted: KaraokeSong[] = data.items
          .filter((item: any) => item.type === 'stream')
          .map((item: any) => {
            const videoId = item.url ? item.url.replace('/watch?v=', '') : '';
            return {
              id: videoId,
              title: item.title || '',
              artist: item.uploaderName || 'YouTube',
              duration: '04:00',
              genre: 'Nhạc Trẻ',
              thumb: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            };
          });
        setResults(formatted);
      } else {
        setResults([]);
      }
    } catch (e) {
      console.warn('Search fetch error:', e);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Search via Web Speech API (supported on TV Remotes, Android TV & Chrome)
  const startVoiceSearch = async () => {
    setVoiceError(null);
    setVoiceTranscript('');
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        'Trình duyệt TV chưa hỗ trợ Web Speech trực tiếp. Quý khách có thể bấm chọn nhanh câu lệnh giọng nói mẫu bên dưới!'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
        } catch (permErr: any) {
          console.warn('Microphone permission check:', permErr);
          if (permErr?.name === 'NotAllowedError' || permErr?.name === 'PermissionDeniedError') {
            setVoiceError('Quyền Micro đang bị chặn. Vui lòng cho phép quyền micro trên trình duyệt/TV.');
            return;
          }
        }
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceTranscript('Đang lắng nghe... Hãy nói tên bài hát vào micro');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalTranscript = event.results[i][0].transcript.trim();
            setQuery(finalTranscript);
            setVoiceTranscript(`Đã nhận diện: "${finalTranscript}"`);
            setIsListening(false);
            performSearch(finalTranscript);
            return;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim) {
          setVoiceTranscript(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError('Vui lòng cấp quyền Microphone trên TV hoặc thiết bị để nói');
        } else if (event.error === 'no-speech') {
          setVoiceError('Chưa nghe thấy giọng nói. Quý khách vui lòng nói lại hoặc bấm câu mẫu');
        } else if (event.error !== 'aborted') {
          setVoiceError('Không nghe rõ hoặc TV chưa hỗ trợ tiếng Việt. Quý khách có thể bấm câu mẫu bên dưới');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
      setVoiceError('Không thể khởi động nhận diện: ' + (err?.message || 'Lỗi micro'));
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setIsListening(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setQuery(initialQuery);
        performSearch(initialQuery);
      } else {
        performSearch('');
      }
      if (autoVoice) {
        startVoiceSearch();
      }
    } else {
      stopVoiceSearch();
    }
  }, [isOpen, initialQuery, autoVoice]);

  if (!isOpen) return null;

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(val);
    }, 400);
  };

  const handleCharClick = (char: string) => {
    const next = query + char;
    handleQueryChange(next);
  };

  const handleDelete = () => {
    const next = query.slice(0, -1);
    handleQueryChange(next);
  };

  const handleSpace = () => {
    const next = query + ' ';
    handleQueryChange(next);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  const handleSelectSuggestion = (sug: string) => {
    setQuery(sug);
    performSearch(sug);
  };

  const handleAddCustom = () => {
    if (!customYoutubeId.trim()) return;
    let vid = customYoutubeId.trim();
    if (vid.includes('v=')) {
      const match = vid.match(/v=([a-zA-Z0-9_-]+)/);
      if (match) vid = match[1];
    } else if (vid.includes('youtu.be/')) {
      const match = vid.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (match) vid = match[1];
    }

    const newSong: KaraokeSong = {
      id: vid,
      title: `Karaoke YouTube (${vid})`,
      artist: 'Người dùng nhập',
      duration: '04:00',
      genre: 'Nhạc Trẻ',
      thumb: `https://img.youtube.com/vi/${vid}/mqdefault.jpg`,
    };
    onSelectSong(newSong, false);
    setCustomYoutubeId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#18181b] border-2 border-red-600/60 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-900 px-6 py-3.5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Tìm Bài Hát YouTube Bằng Remote TV
              <span className="text-xs bg-red-600/30 text-red-300 px-2 py-0.5 rounded-full border border-red-500/40">
                Live YouTube
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Search input display */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center gap-3">
          <div className="flex-1 bg-neutral-900 border border-neutral-700 focus-within:border-red-500 rounded-xl px-4 py-2.5 flex items-center gap-3 text-lg transition">
            <Search className="w-5 h-5 text-red-500 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') performSearch(query);
              }}
              placeholder="Nhập tên bài hát hoặc bấm micro để nói..."
              className="bg-transparent text-white focus:outline-none flex-1 font-semibold text-base"
              autoFocus
            />
            {isLoading && <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />}
            {query && !isLoading && (
              <button onClick={handleClear} className="text-neutral-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={isListening ? stopVoiceSearch : startVoiceSearch}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition shrink-0 ${
              isListening
                ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/50'
                : 'bg-neutral-850 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-600/40'
            }`}
            title="Bấm để nói tìm kiếm bài hát bằng Remote TV hoặc micro"
          >
            <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce text-white' : ''}`} />
            <span>{isListening ? 'Đang nghe...' : 'Nói bằng Remote'}</span>
          </button>

          <button
            onClick={() => performSearch(query)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition shrink-0"
          >
            Tìm Ngay
          </button>
        </div>

        {/* Voice Listening Status Banner */}
        {isListening && (
          <div className="mx-4 mt-3 p-3 bg-red-950/80 border border-red-600/70 rounded-xl flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center animate-pulse">
                <Mic className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  Đang thu âm từ Micro Remote TV...
                </p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {voiceTranscript || 'Hãy nói tên bài hát (Ví dụ: "Hoa Nở Không Màu", "Cắt Đôi Nỗi Sầu")...'}
                </p>
              </div>
            </div>
            <button
              onClick={stopVoiceSearch}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold rounded-lg text-neutral-300 border border-neutral-700"
            >
              Dừng nói
            </button>
          </div>
        )}

        {voiceError && (
          <div className="mx-4 mt-2 p-3 bg-neutral-900 border border-amber-600/70 rounded-xl text-xs text-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-amber-300">
                <span>🎙️</span> {voiceError}
              </span>
              <button
                onClick={() => setVoiceError(null)}
                className="text-neutral-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded bg-neutral-800"
              >
                ✕
              </button>
            </div>
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-neutral-400 font-semibold">Bấm thử nhanh lệnh thoại:</span>
              {['Hoa Nở Không Màu', 'Cắt Đôi Nỗi Sầu', 'Duyên Phận Bolero', 'Ai Chung Tình Được Mãi', 'Tone Nam', 'Tone Nữ'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setVoiceError(null);
                    setQuery(s);
                    performSearch(s);
                  }}
                  className="px-2.5 py-1 bg-red-950/60 hover:bg-red-600 border border-red-700/60 hover:border-red-500 rounded-lg text-white font-medium text-[11px] transition"
                >
                  🗣️ "{s}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick suggestions */}
        <div className="px-4 py-2 bg-neutral-900/40 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs text-neutral-400 shrink-0 font-medium">Gợi ý nhanh:</span>
          {SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              onClick={() => handleSelectSuggestion(sug)}
              className="text-xs px-3 py-1 bg-neutral-800 hover:bg-red-600 hover:text-white border border-neutral-700 rounded-full text-neutral-200 transition shrink-0"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Main Grid: On-screen TV Keyboard & Results */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Virtual Keyboard (Left) */}
          <div className="md:col-span-5 bg-neutral-900/80 p-4 border-r border-neutral-800 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-2">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Bàn phím Remote TV</span>
                <span className="text-[10px] text-amber-400">Dùng phím D-Pad điều khiển</span>
              </div>
              {KEYS.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-9 gap-1.5">
                  {row.map((ch) => (
                    <button
                      key={ch}
                      onClick={() => handleCharClick(ch)}
                      className="aspect-square bg-neutral-800 hover:bg-red-600 hover:text-white text-neutral-200 font-bold text-sm rounded-lg border border-neutral-700 flex items-center justify-center transition active:scale-95 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              ))}

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={handleSpace}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-2.5 rounded-lg border border-neutral-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Space className="w-4 h-4" />
                  <span>Cách</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-2.5 rounded-lg border border-neutral-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Delete className="w-4 h-4" />
                  <span>Xóa</span>
                </button>
                <button
                  onClick={handleClear}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-2.5 rounded-lg border border-neutral-700 flex items-center justify-center gap-1.5 transition"
                >
                  <span>Xóa hết</span>
                </button>
              </div>
            </div>

            {/* Direct YouTube link paste */}
            <div className="mt-4 pt-3 border-t border-neutral-800">
              <div className="text-xs text-neutral-400 font-semibold mb-1">
                Hoặc dán link YouTube bất kỳ:
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ID hoặc Link YouTube..."
                  value={customYoutubeId}
                  onChange={(e) => setCustomYoutubeId(e.target.value)}
                  className="bg-neutral-950 border border-neutral-700 text-xs px-2.5 py-1.5 rounded flex-1 text-white focus:outline-none"
                />
                <button
                  onClick={handleAddCustom}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded transition"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Results List (Right) */}
          <div className="md:col-span-7 p-4 overflow-y-auto space-y-2 bg-[#121214]">
            <div className="text-xs text-neutral-400 font-semibold mb-2 flex items-center justify-between">
              <span>Kết
