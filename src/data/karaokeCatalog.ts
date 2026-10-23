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

export const POPULAR_KARAOKE_SONGS: KaraokeSong[] = [
  {
    id: '1k8craCGpgs',
    title: 'Hoa Nở Không Màu - Karaoke Beat Chuẩn',
    artist: 'Hoài Lâm',
    duration: '4:35',
    genre: 'Nhạc Trẻ',
    tone: 'Tone Nam (Dm)',
    thumb: 'https://img.youtube.com/vi/1k8craCGpgs/mqdefault.jpg',
    views: '45M'
  },
  {
    id: 'N20_S1eG838',
    title: 'Cắt Đôi Nỗi Sầu - Karaoke Remix Sôi Động',
    artist: 'Tăng Duy Tân',
    duration: '3:15',
    genre: 'Remix',
    tone: 'Tone Nam (Em)',
    thumb: 'https://img.youtube.com/vi/N20_S1eG838/mqdefault.jpg',
    views: '32M'
  },
  {
    id: 'M-MTA33mK38',
    title: 'Ngày Em Đẹp Nhất - Karaoke Beat Gốc',
    artist: 'Bell',
    duration: '4:10',
    genre: 'Nhạc Trẻ',
    tone: 'Tone Nam',
    thumb: 'https://img.youtube.com/vi/M-MTA33mK38/mqdefault.jpg',
    views: '18M'
  },
  {
    id: '344kO5S3CIs',
    title: 'Ai Chung Tình Được Mãi - Karaoke Beat Chuẩn',
    artist: 'Đinh Tùng Huy',
    duration: '5:02',
    genre: 'Nhạc Trẻ',
    tone: 'Tone Nam',
    thumb: 'https://img.youtube.com/vi/344kO5S3CIs/mqdefault.jpg',
    views: '55M'
  },
  {
    id: 'aT5V9L3vY1A',
    title: 'Sầu Tím Thiệp Hồng - Karaoke Song Ca Trữ Tình',
    artist: 'Quang Lê & Lệ Quyên',
    duration: '5:12',
    genre: 'Song Ca',
    tone: 'Song Ca Nam Nữ',
    thumb: 'https://img.youtube.com/vi/aT5V9L3vY1A/mqdefault.jpg',
    views: '80M'
  },
  {
    id: 'F5W90qI0ZcQ',
    title: 'Duyên Phận - Karaoke Tone Nữ Trầm Ấm',
    artist: 'Như Quỳnh',
    duration: '5:45',
    genre: 'Bolero',
    tone: 'Tone Nữ (Am)',
    thumb: 'https://img.youtube.com/vi/F5W90qI0ZcQ/mqdefault.jpg',
    views: '120M'
  },
  {
    id: '3qR3cZfO_aU',
    title: 'Xuân Này Con Không Về - Karaoke Bolero Bất Hủ',
    artist: 'Duy Khánh / Quang Lê',
    duration: '6:02',
    genre: 'Bolero',
    tone: 'Tone Nam',
    thumb: 'https://img.youtube.com/vi/3qR3cZfO_aU/mqdefault.jpg',
    views: '40M'
  },
  {
    id: 'jZ3g0dGg1pM',
    title: 'Gặp Nhau Giữa Rừng Mơ - Karaoke Song Ca',
    artist: 'Trọng Tấn & Anh Thơ',
    duration: '4:48',
    genre: 'Song Ca',
    tone: 'Song Ca Nam Nữ',
    thumb: 'https://img.youtube.com/vi/jZ3g0dGg1pM/mqdefault.jpg',
    views: '22M'
  },
  {
    id: 'V1bFr2SWP1I',
    title: 'Đám Cưới Chuột - Karaoke Remix Vui Nhộn',
    artist: 'Giao Hưởng Rock',
    duration: '3:40',
    genre: 'Remix',
    tone: 'Tone Nam',
    thumb: 'https://img.youtube.com/vi/V1bFr2SWP1I/mqdefault.jpg',
    views: '15M'
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Despacito - Karaoke Beat Phiên Bản Việt',
    artist: 'Luis Fonsi / Cover',
    duration: '3:50',
    genre: 'Remix',
    tone: 'Tone Nam',
    thumb: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
    views: '19M'
  },
  {
    id: '2Vv-BfVoq4g',
    title: 'Vùng Lá Me Bay - Karaoke Bolero Tone Nữ',
    artist: 'Như Quỳnh',
    duration: '5:20',
    genre: 'Bolero',
    tone: 'Tone Nữ',
    thumb: 'https://img.youtube.com/vi/2Vv-BfVoq4g/mqdefault.jpg',
    views: '65M'
  },
  {
    id: 'YVkUvmDQ3HY',
    title: 'Con Đường Xưa Em Đi - Karaoke Bolero Chuẩn',
    artist: 'Chế Linh',
    duration: '4:55',
    genre: 'Bolero',
    tone: 'Tone Nam',
    thumb: 'https://img.youtube.com/vi/YVkUvmDQ3HY/mqdefault.jpg',
    views: '75M'
  },
  {
    id: '9bZkp7q19f0',
    title: 'Tình Cha - Karaoke Tone Nam Da Diết',
    artist: 'Ngọc Sơn',
    duration: '5:10',
    genre: 'Tone Nam',
    tone: 'Tone Nam',
    thumb: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
    views: '48M'
  },
  {
    id: 'OPf0YbXqDm0',
    title: 'Lòng Mẹ - Karaoke Tone Nữ Cảm Xúc',
    artist: 'Giao Linh',
    duration: '5:35',
    genre: 'Tone Nữ',
    tone: 'Tone Nữ',
    thumb: 'https://img.youtube.com/vi/OPf0YbXqDm0/mqdefault.jpg',
    views: '35M'
  },
  {
    id: 'CevxZvSJLk8',
    title: 'Bên Trên Tầng Lầu - Karaoke Remix Cực Căng',
    artist: 'Tăng Duy Tân',
    duration: '3:05',
    genre: 'Remix',
    tone: 'Tone Nam',
    thumb: 'https://img.youtube.com/vi/CevxZvSJLk8/mqdefault.jpg',
    views: '50M'
  },
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Nàng Thơ - Karaoke Beat Chuẩn Hoàng Dũng',
    artist: 'Hoàng Dũng',
    duration: '4:15',
    genre: 'Nhạc Trẻ',
    tone: 'Tone Nam',
    thumb: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
    views: '60M'
  },
  {
    id: 'uelHwf8o7_U',
    title: 'Waiting For You - Karaoke Tone Nam',
    artist: 'MONO',
    duration: '4:25',
    genre: 'Nhạc Trẻ',
    tone: 'Tone Nam',
    thumb: 'https://img.youtube.com/vi/uelHwf8o7_U/mqdefault.jpg',
    views: '70M'
  },
  {
    id: 'astISOttCQ0',
    title: 'Đất Nước Trọn Niềm Vui - Karaoke Quê Hương',
    artist: 'Tạ Minh Tâm',
    duration: '4:10',
    genre: 'Quê Hương',
    tone: 'Tone Nam Hào Hùng',
    thumb: 'https://img.youtube.com/vi/astISOttCQ0/mqdefault.jpg',
    views: '28M'
  }
];
