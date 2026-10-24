import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// In-memory room state for real-time TV <-> Mobile Remote sync
interface SongItem {
  id: string;
  title: string;
  duration: string;
  thumb: string;
  artist?: string;
  genre?: string;
  requestedBy?: string;
}

interface RoomState {
  roomId: string;
  currentSong: SongItem | null;
  queue: SongItem[];
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  pitch: number;
  speed: number;
  lastUpdated: number;
  lastCommand?: {
    action: string;
    payload?: any;
    timestamp: number;
  };
}

const rooms = new Map<string, RoomState>();
const roomSubscribers = new Map<string, Set<Response>>();



function getOrCreateRoom(roomId: string): RoomState {
  const normId = (roomId || 'default').toUpperCase().trim();
  if (!rooms.has(normId)) {
    rooms.set(normId, {
      roomId: normId,
      currentSong: null,
      queue: [],
      isPlaying: false,
      isMuted: false,
      volume: 100,
      pitch: 0,
      speed: 1.0,
      lastUpdated: Date.now(),
    });
  }
  return rooms.get(normId)!;
}

function notifySubscribers(roomId: string, eventType: string, data: any) {
  const normId = (roomId || 'default').toUpperCase().trim();
  const subs = roomSubscribers.get(normId);
  if (!subs) return;
  const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of subs) {
    try {
      client.write(message);
    } catch {
      subs.delete(client);
    }
  }
}

// REST endpoints for TV and Mobile Remote synchronization
app.get('/api/room/:id/state', (req: Request, res: Response) => {
  const room = getOrCreateRoom(req.params.id);
  res.json(room);
});

app.post('/api/room/:id/state', (req: Request, res: Response) => {
  const room = getOrCreateRoom(req.params.id);
  const { currentSong, queue, isPlaying, isMuted, volume, pitch, speed } = req.body;
  if (currentSong !== undefined) room.currentSong = currentSong;
  if (queue !== undefined) room.queue = queue;
  if (isPlaying !== undefined) room.isPlaying = isPlaying;
  if (isMuted !== undefined) room.isMuted = isMuted;
  if (volume !== undefined) room.volume = volume;
  if (pitch !== undefined) room.pitch = pitch;
  if (speed !== undefined) room.speed = speed;
  room.lastUpdated = Date.now();

  notifySubscribers(room.roomId, 'state', room);
  res.json({ success: true, room });
});

// Mobile commands to TV
app.post('/api/room/:id/command', (req: Request, res: Response) => {
  const room = getOrCreateRoom(req.params.id);
  const { action, payload, senderId } = req.body;
  const cmd = {
    action,
    payload,
    senderId,
    timestamp: Date.now(),
  };
  room.lastCommand = cmd;
  room.lastUpdated = Date.now();

  // Also handle queue additions directly if requested
  if (action === 'addToQueue' && payload) {
    const { song, playNow } = payload;
    if (playNow) {
      room.queue.unshift(song);
    } else {
      room.queue.push(song);
    }
  } else if (action === 'removeFromQueue' && payload !== undefined) {
    const idx = payload.index;
    if (typeof idx === 'number' && idx >= 0 && idx < room.queue.length) {
      room.queue.splice(idx, 1);
    }
  } else if (action === 'prioritize' && payload !== undefined) {
    const idx = payload.index;
    if (typeof idx === 'number' && idx > 0 && idx < room.queue.length) {
      const [item] = room.queue.splice(idx, 1);
      room.queue.unshift(item);
    }
  }

  notifySubscribers(room.roomId, 'command', cmd);
  notifySubscribers(room.roomId, 'state', room);
  res.json({ success: true, room, command: cmd });
});

// SSE endpoint for low-latency live synchronization across internet / Wi-Fi
app.get('/api/room/:id/stream', (req: Request, res: Response) => {
  const normId = (req.params.id || 'default').toUpperCase().trim();
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  if (!roomSubscribers.has(normId)) {
    roomSubscribers.set(normId, new Set());
  }
  const subs = roomSubscribers.get(normId)!;
  subs.add(res);

  // Send current state immediately
  const room = getOrCreateRoom(normId);
  res.write(`event: state\ndata: ${JSON.stringify(room)}\n\n`);

  // Heartbeat every 20s
  const keepAliveInterval = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 20000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
    subs.delete(res);
  });
});

// Live YouTube Search Endpoint for Karaoke
app.get('/api/youtube/search', async (req: Request, res: Response) => {
  try {
    const rawQ = ((req.query.q as string) || '').trim();
    if (!rawQ) {
      return res.json({ query: '', results: [] });
    }

    // Direct YouTube URL or 11-char Video ID
    let directId = '';
    if (rawQ.includes('v=')) {
      const match = rawQ.match(/v=([a-zA-Z0-9_-]{11})/);
      if (match) directId = match[1];
    } else if (rawQ.includes('youtu.be/')) {
      const match = rawQ.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (match) directId = match[1];
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(rawQ)) {
      directId = rawQ;
    }

    if (directId) {
      return res.json({
        query: rawQ,
        results: [
          {
            id: directId,
            title: `Karaoke YouTube (${directId})`,
            artist: 'YouTube Video',
            duration: '04:00',
            genre: 'Nhạc Trẻ',
            thumb: `https://img.youtube.com/vi/${directId}/mqdefault.jpg`,
            views: 'Trực tiếp',
          },
        ],
      });
    }

    // Append 'karaoke' if not specified to target instrumental/beat versions
    const searchQuery = /karaoke/i.test(rawQ) ? rawQ : `${rawQ} karaoke`;

    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    let results: any[] = [];

    try {
      const response = await fetch(ytUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cookie': 'CONSENT=YES+1; SOCS=CAESEwgDEgk2ODEyNDc4NjQaAmVuIAEaBgiA_LyaBg',
        },
      });

      const html = await response.text();
      
      // Strategy 1: Match ytInitialData object
      const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/) ||
                    html.match(/var\s+ytInitialData\s*=\s*({.+?});/) ||
                    html.match(/window\["ytInitialData"\]\s*=\s*({.+?});/);

      if (match) {
        try {
          const data = JSON.parse(match[1]);
          const contents =
            data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
          const itemSection = contents?.find((c: any) => c.itemSectionRenderer)?.itemSectionRenderer;

          if (itemSection?.contents) {
            for (const item of itemSection.contents) {
              const v = item.videoRenderer;
              if (!v || !v.videoId) continue;

              const title =
                v.title?.runs?.map((r: any) => r.text).join('') || v.title?.simpleText || '';
              const artist = v.ownerText?.runs?.[0]?.text || 'Karaoke Beat';
              const duration = v.lengthText?.simpleText || '04:00';
              const views = v.viewCountText?.simpleText || '';
              const thumb =
                v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url ||
                `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`;

              let tone = '';
              if (/tone nam|giọng nam/i.test(title)) tone = 'Tone Nam';
              else if (/tone nữ|giọng nữ/i.test(title)) tone = 'Tone Nữ';
              else if (/song ca/i.test(title)) tone = 'Song Ca';

              let genre = 'Nhạc Trẻ';
              if (/bolero|trữ tình|nhạc vàng/i.test(title)) genre = 'Bolero';
              else if (/remix|dj|vinahey|nonstop/i.test(title)) genre = 'Remix';
              else if (/song ca/i.test(title)) genre = 'Song Ca';
              else if (/quê hương|cách mạng|đất nước/i.test(title)) genre = 'Quê Hương';

              results.push({
                id: v.videoId,
                title,
                artist,
                duration,
                views,
                genre,
                tone,
                thumb,
              });

              if (results.length >= 25) break;
            }
          }
        } catch (parseErr) {
          console.error('Error parsing ytInitialData:', parseErr);
        }
      }

      // Strategy 2: If strategy 1 returned no results, scrape video patterns directly
      if (results.length === 0) {
        const regex = /"videoId":"([a-zA-Z0-9_-]{11})".+?"title":\{"runs":\[\{"text":"([^"]+)"\}\]/g;
        let m: RegExpExecArray | null;
        const seen = new Set<string>();
        while ((m = regex.exec(html)) !== null && results.length < 20) {
          const videoId = m[1];
          const title = m[2];
          if (!seen.has(videoId)) {
            seen.add(videoId);
            results.push({
              id: videoId,
              title,
              artist: 'Karaoke Beat Chuẩn',
              duration: '04:00',
              views: 'YouTube',
              genre: /bolero/i.test(title) ? 'Bolero' : /remix/i.test(title) ? 'Remix' : 'Nhạc Trẻ',
              tone: /tone nam/i.test(title) ? 'Tone Nam' : /tone nữ/i.test(title) ? 'Tone Nữ' : '',
              thumb: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            });
          }
        }
      }
    } catch (fetchErr) {
      console.warn('Direct YouTube fetch error:', fetchErr);
    }

    res.json({ query: rawQ, results });
  } catch (err: any) {
    console.error('YouTube search error:', err);
    res.json({ query: req.query.q || '', results: [] });
  }
});

// YouTube autocomplete suggestions endpoint
app.get('/api/youtube/suggest', async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    if (!q) return res.json({ suggestions: [] });

    const suggestUrl = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&hl=vi&q=${encodeURIComponent(
      q
    )}`;
    const response = await fetch(suggestUrl);
    const text = await response.text();

    const match = text.match(/window\.google\.ac\.h\((.*)\)/);
    if (match) {
      const data = JSON.parse(match[1]);
      const suggestions = (data[1] || []).map((item: any) => item[0]);
      return res.json({ suggestions });
    }
    res.json({ suggestions: [] });
  } catch (err) {
    res.json({ suggestions: [] });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`> Oanh Điền Karaoke Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch(console.error);
