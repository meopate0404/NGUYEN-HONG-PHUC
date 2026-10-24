export interface KaraokeSong {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre: 'Bolero' | 'Nhạc Trẻ' | 'Remix' | 'Song Ca' | 'Tone Nam' | 'Tone Nữ' | 'Quê Hương';
  thumb: string;
  tone?: string;
  views?: string;
}

export const POPULAR_KARAOKE_SONGS: KaraokeSong[] = [];

