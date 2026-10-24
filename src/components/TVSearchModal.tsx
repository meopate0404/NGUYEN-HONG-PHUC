import React, { useState, useRef, useEffect } from 'react';
import { Search, Delete, Space, Mic, X, Loader2 } from 'lucide-react';
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

      let items: any[] = [];

      try {
        const invRes = await fetch(`https://invidious.privacyredirect.com/api/v1/search?q=${encodeURIComponent(searchQuery)}&type=video`);
        if (invRes.ok) {
          const invData = await invRes.json();
          if (Array.isArray(invData)) {
            items = invData.map((vid: any) => ({
              type: 'stream',
              url: `/watch?v=${vid.videoId}`,
              title: vid.title,
              uploaderName: vid.author,
              thumbnail: vid.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${vid.videoId}/hqdefault.jpg`
            }));
          }
        }
      } catch (err) {
        console.warn('Invidious failed, trying Piped...');
      }

      if (items.length === 0) {
        const pipedRes = await fetch(`https://pipedapi.adminforge.de/search?q=${encodeURIComponent(searchQuery)}&filter=all`);
        if (pipedRes.ok) {
          const pipedData = await pipedRes.json();
          if (pipedData && Array.isArray(pipedData.items)) {
            items = pipedData.items.filter((item: any) => item.type === 'stream');
          }
        }
      }

      if (items.length > 0) {
        const formatted: KaraokeSong[] = items.map((item: any) => {
          const videoId = item.url ? item.url.replace('/watch?v=', '') : (item.videoId || '');
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

  const startVoiceSearch = async () => {
    setVoiceError(null);
    setVoiceTranscript('');
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Trình duyệt TV chưa hỗ trợ Web Speech trực tiếp.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceTranscript('Đang lắng nghe...');
      };

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalTranscript = event.results[i][0].transcript.trim();
            setQuery(finalTranscript);
            setIsListening(false);
            performSearch(finalTranscript);
            return;
          }
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
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
      if (autoVoice) startVoiceSearch();
    } else {
      stopVoiceSearch();
    }
  }, [isOpen, initialQuery, autoVoice]);

  if (!isOpen) return null;

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => performSearch(val), 400);
  };

  const handleCharClick = (char: string) => handleQueryChange(query + char);
  const handleDelete = () => handleQueryChange(query.slice(0, -1));
  const handleSpace = () => handleQueryChange(query + ' ');
  const handleClear = () => { setQuery(''); setResults([]); };
  const handleSelectSuggestion = (sug: string) => { setQuery(sug); performSearch(sug); };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#18181b] border-2 border-red-600/60 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
        <div className="bg-neutral-900 px-6 py-3.5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Tìm Bài Hát YouTube Bằng Remote TV
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold">✕</button>
        </div>

        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center gap-3">
          <div className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 flex items-center gap-3 text-lg">
            <Search className="w-5 h-5 text-red-500 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') performSearch(query); }}
              placeholder="Nhập tên bài hát..."
              className="bg-transparent text-white focus:outline-none flex-1 font-semibold text-base"
              autoFocus
            />
            {isLoading && <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />}
            {query && !isLoading && (
              <button onClick={handleClear} className="text-neutral-400 hover:text-white p-1"><X className="w-4 h-4" /></button>
            )}
          </div>
          <button onClick={isListening ? stopVoiceSearch : startVoiceSearch} className="px-4 py-2.5 rounded-xl font-bold text-sm bg-neutral-850 text-red-400 border border-red-600/40">
            <Mic className="w-4 h-4 inline mr-1" /> {isListening ? 'Đang nghe...' : 'Nói'}
          </button>
          <button onClick={() => performSearch(query)} className="px-5 py-2.5 bg-red-600 text-white font-bold text-sm rounded-xl">Tìm Ngay</button>
        </div>

        <div className="px-4 py-2 bg-neutral-900/40 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-neutral-400 shrink-0">Gợi ý:</span>
          {SUGGESTIONS.map((sug) => (
            <button key={sug} onClick={() => handleSelectSuggestion(sug)} className="text-xs px-3 py-1 bg-neutral-800 hover:bg-red-600 rounded-full text-neutral-200 shrink-0">{sug}</button>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          <div className="md:col-span-5 bg-neutral-900/80 p-4 border-r border-neutral-800 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs font-bold text-neutral-400 uppercase mb-2">Bàn phím Remote TV</div>
              {KEYS.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-9 gap-1.5">
                  {row.map((ch) => (
                    <button key={ch} onClick={() => handleCharClick(ch)} className="aspect-square bg-neutral-800 hover:bg-red-600 text-neutral-200 font-bold text-sm rounded-lg border border-neutral-700 flex items-center justify-center">{ch}</button>
                  ))}
                </div>
              ))}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button onClick={handleSpace} className="bg-neutral-800 text-white font-bold text-xs py-2.5 rounded-lg border border-neutral-700 flex items-center justify-center gap-1"><Space className="w-4 h-4" /> Cách</button>
                <button onClick={handleDelete} className="bg-neutral-800 text-white font-bold text-xs py-2.5 rounded-lg border border-neutral-700 flex items-center justify-center gap-1"><Delete className="w-4 h-4" /> Xóa</button>
                <button onClick={handleClear} className="bg-neutral-800 text-white font-bold text-xs py-2.5 rounded-lg border border-neutral-700 flex items-center justify-center">Xóa hết</button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800">
              <div className="text-xs text-neutral-400 mb-1">Dán link YouTube:</div>
              <div className="flex gap-2">
                <input type="text" placeholder="ID/Link..." value={customYoutubeId} onChange={(e) => setCustomYoutubeId(e.target.value)} className="bg-neutral-950 border border-neutral-700 text-xs px-2.5 py-1.5 rounded flex-1 text-white" />
                <button onClick={handleAddCustom} className="px-3 py-1.5 bg-red-600 text-white font-bold text-xs rounded">Thêm</button>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 p-4 overflow-y-auto space-y-2 bg-[#121214]">
            <div className="text-xs text-neutral-400 font-semibold mb-2">Kết quả YouTube ({results.length} bài hát)</div>
            {results.length === 0 ? (
              <div className="text-center py-16 text-neutral-400 text-sm">
                <Search className="w-10 h-10 text-neutral-600 mb-3 mx-auto" />
                <div className="font-bold text-white text-base">Tìm Bài Hát Trên YouTube</div>
              </div>
            ) : (
              results.map((song) => (
                <div key={song.id} className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-between gap-3">
                  <img src={song.thumb} alt={song.title} className="w-18 h-12 object-cover rounded-lg shrink-0 border border-neutral-700" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{song.title}</div>
                    <div className="text-xs text-neutral-400">{song.artist} • {song.genre}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { onSelectSong(song, false); onClose(); }} className="px-3 py-1.5 bg-neutral-800 text-neutral-200 text-xs font-semibold rounded-lg">+ Hàng chờ</button>
                    <button onClick={() => { onSelectSong(song, true); onClose(); }} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg">Hát ngay</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
