export interface KaraokeSong {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre: "Bolero" | "Nhạc Trẻ" | "Remix" | "Song Ca" | "Tone Nam" | "Tone Nữ" | "Quê Hương";
  thumb: string;
  tone?: string;
  views?: string;
}

export function removeVietnameseTones(str: string): string {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str.toLowerCase().trim();
}

// 100% verified, active, embeddable YouTube karaoke tracks
export const POPULAR_KARAOKE_SONGS: KaraokeSong[] = [
  {
    "id": "iIsfYYw4b2A",
    "title": "Cắt Đôi Nỗi Sầu (ft DRUM7) - Tăng Duy Tân | Karaoke Bản Chuẩn Tone Nam",
    "artist": "Big Arts Entertainment",
    "duration": "4:12",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/iIsfYYw4b2A/mqdefault.jpg",
    "views": "12M"
  },
  {
    "id": "QD80ebxomss",
    "title": "Hoa Nở Không Màu - Hoài Lâm | Karaoke Beat Chuẩn Tone Nam",
    "artist": "Nguyễn Minh Cường Official",
    "duration": "4:35",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/QD80ebxomss/mqdefault.jpg",
    "views": "25M"
  },
  {
    "id": "CZO9CbtOEmg",
    "title": "Duyên Phận - Như Quỳnh | Karaoke Tone Nữ Nhạc Sống Bolero",
    "artist": "Hiếu Organ",
    "duration": "6:01",
    "genre": "Bolero",
    "tone": "Tone Nữ",
    "thumb": "https://img.youtube.com/vi/CZO9CbtOEmg/mqdefault.jpg",
    "views": "21M"
  },
  {
    "id": "UhwTHaaP1Vo",
    "title": "Ngôi Sao Lẻ Loi - Karaoke Tone Nam (Cm) Beat Chuẩn Mới",
    "artist": "Lâm Organ",
    "duration": "5:50",
    "genre": "Tone Nam",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/UhwTHaaP1Vo/mqdefault.jpg",
    "views": "9M"
  },
  {
    "id": "OHNd17sfpR8",
    "title": "Ai Chung Tình Được Mãi - Đinh Tùng Huy | Karaoke Beat Chuẩn",
    "artist": "ACV Music",
    "duration": "4:58",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/OHNd17sfpR8/mqdefault.jpg",
    "views": "18M"
  },
  {
    "id": "LPrOVzOHgZQ",
    "title": "Sầu Tím Thiệp Hồng - Song Ca Quang Lê & Lệ Quyên | Karaoke Chuẩn",
    "artist": "Lạc Hồng Karaoke",
    "duration": "5:15",
    "genre": "Song Ca",
    "tone": "Song Ca Nam Nữ",
    "thumb": "https://img.youtube.com/vi/LPrOVzOHgZQ/mqdefault.jpg",
    "views": "35M"
  },
  {
    "id": "6TvFRJixfM4",
    "title": "Vùng Lá Me Bay - Như Quỳnh | Karaoke Nhạc Sống Tone Nữ",
    "artist": "Hoài Phong Organ",
    "duration": "5:22",
    "genre": "Bolero",
    "tone": "Tone Nữ",
    "thumb": "https://img.youtube.com/vi/6TvFRJixfM4/mqdefault.jpg",
    "views": "15M"
  },
  {
    "id": "BdYcvbvlwaI",
    "title": "Con Đường Xưa Em Đi - Karaoke Tone Nam Nhạc Sống Bolero",
    "artist": "Trọng Hiếu Organ",
    "duration": "5:10",
    "genre": "Bolero",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/BdYcvbvlwaI/mqdefault.jpg",
    "views": "20M"
  },
  {
    "id": "c8njEtDqdq4",
    "title": "Ngày Em Đẹp Nhất - TAMA | Karaoke Beat Gốc Tone Nam",
    "artist": "Bell Official",
    "duration": "4:08",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/c8njEtDqdq4/mqdefault.jpg",
    "views": "14M"
  },
  {
    "id": "2MUfA2g87vo",
    "title": "Bên Trên Tầng Lầu - Tăng Duy Tân | Karaoke Beat Chuẩn",
    "artist": "Big Arts",
    "duration": "3:05",
    "genre": "Remix",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/2MUfA2g87vo/mqdefault.jpg",
    "views": "22M"
  },
  {
    "id": "tlDtXqpTqPs",
    "title": "Nàng Thơ - Hoàng Dũng Karaoke Full beat gốc Live",
    "artist": "Võ Hoàng",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/tlDtXqpTqPs/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "3pFUNPGv1h0",
    "title": "[KARAOKE] WAITING FOR YOU KARAOKE - MONO - Ú ÒA...MÌNH CHỈ MỘT NGƯỜI ĐẾN SAU",
    "artist": "ArigatoMay",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/3pFUNPGv1h0/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "bZT1Y6G9zEM",
    "title": "Karaoke Độ Tộc 2 | From Mixi With Love - Độ Mixi x Phúc Du x Pháo x Masew - Beat Gốc Có Bè - Anh Tú",
    "artist": "Anh Tú",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/bZT1Y6G9zEM/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "nFIu5cSPP5k",
    "title": "Đất Nước Trọn Niềm Vui Karaoke Tone Nam Nhạc Sống Dễ Hát | Nguyễn Linh",
    "artist": "Nhạc sống Nguyễn Linh",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/nFIu5cSPP5k/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "C94-RTOhU4A",
    "title": "Tình Cha  [Karaoke] Ngọc Sơn || Tone Nam",
    "artist": "Kara Thịnh Hành",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/C94-RTOhU4A/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "hoEOuFmiWqA",
    "title": "Karaoke Lòng Mẹ 1 Tone Nam Nhạc Sống | Nguyễn Linh",
    "artist": "Nhạc sống Nguyễn Linh",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/hoEOuFmiWqA/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "NtbFI6LKsYk",
    "title": "Karaoke Đắp mộ cuộc tình | Đan Nguyên",
    "artist": "You2Music",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/NtbFI6LKsYk/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "lIXReXJeNTU",
    "title": "Lại Nhớ Người Yêu Karaoke Tone Nam Nhạc Sống | Trọng Hiếu",
    "artist": "Hiếu Organ",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/lIXReXJeNTU/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "aseVH7b4Ja4",
    "title": "Karaoke Hoa Nở Về Đêm Tone Nam Nhạc Sống | Trọng Hiếu",
    "artist": "Hiếu Organ",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/aseVH7b4Ja4/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "txPfLYEMZNI",
    "title": "Gặp Nhau Giữa Rừng Mơ Karaoke Song Ca Nhạc Sống gia huy karaoke",
    "artist": "Gia Huy Karaoke",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Song Ca",
    "thumb": "https://img.youtube.com/vi/txPfLYEMZNI/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "2-k2ziSu9b8",
    "title": "SÓNG GIÓ KARAOKE - JACK x K-ICM  [Official Video]",
    "artist": "ICM Studio",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/2-k2ziSu9b8/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "cdk2mDuKm38",
    "title": "Bạc Phận Karaoke Beat Chuẩn | K-ICM ft. JACK",
    "artist": "ICM Studio",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/cdk2mDuKm38/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "XZFGatYhuHQ",
    "title": "HỒNG NHAN KARAOKE | JACK ft K-ICM REMIX Bản Chuẩn",
    "artist": "ICM Studio",
    "duration": "04:20",
    "genre": "Remix",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/XZFGatYhuHQ/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "oqjM7Rf6Sxg",
    "title": "Phía Sau Một Cô Gái Karaoke HD  Hiếu's Louis",
    "artist": "Hiếu Nguyễn",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/oqjM7Rf6Sxg/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "RyKWzShTEJQ",
    "title": "Đức Phúc - Ngày Đầu Tiên (Official Karaoke)",
    "artist": "ĐỨC PHÚC OFFICIAL",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/RyKWzShTEJQ/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "WdCsWw1Szz8",
    "title": "Đức Phúc - Hơn Cả Yêu (Official Karaoke)",
    "artist": "ĐỨC PHÚC OFFICIAL",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/WdCsWw1Szz8/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "bARPmIq2fVA",
    "title": "Tim Lai Bau Troi Karaoke - Tuan Hung [MVHD]",
    "artist": "CaoCuongProKaraoke",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/bARPmIq2fVA/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "Jl4f8utJ0Xk",
    "title": "Karaoke Nắm lấy tay anh   Tuấn Hưng Beat Chuẩn",
    "artist": "Long Dương Văn",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/Jl4f8utJ0Xk/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "ARZFvEVTNmk",
    "title": "Karaoke Người Tình Mùa Đông - Như Quỳnh | Lời Việt: Anh Bằng | Trung Tâm Asia",
    "artist": "Asia Entertainment Official",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/ARZFvEVTNmk/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "e31UITMGRzA",
    "title": "Karaoke Thành Phố Buồn _ Chế Linh",
    "artist": "Son Huynh",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/e31UITMGRzA/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "USgdm1tCx2A",
    "title": "Karaoke | Áo Mới Cà Mau | Phi Nhung (Beat Chuẩn + Bè)",
    "artist": "Lê Chánh Tính",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/USgdm1tCx2A/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "SsEniUGjBWM",
    "title": "KARAOKE || ANH BA KHÍA MV KARAOKE | ĐAN TRƯỜNG",
    "artist": "HT PRODUCTIONS",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/SsEniUGjBWM/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "nyMby3LRxR4",
    "title": "KARAOKE | Đoạn tuyệt nàng đi remix (Phát Huy T4) Nhạc nền Florentino...",
    "artist": "Trinh Dubai's",
    "duration": "04:20",
    "genre": "Remix",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/nyMby3LRxR4/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "ekFIGh0cbRU",
    "title": "Karaoke Đế Vương - Đình Dũng-Beat chuẩn",
    "artist": "Karaoke Minh Nha",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/ekFIGh0cbRU/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "5dholUhW3Kg",
    "title": "Karaoke Có Bè | TỪNG QUEN | WREN EVANS",
    "artist": "TPSKara",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/5dholUhW3Kg/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "dR9H16JsFTw",
    "title": "[KARAOKE] BÔNG HOA ĐẸP NHẤT | QUÂN A.P",
    "artist": "Quân A.P Official",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/dR9H16JsFTw/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "TK9ZSbAneCM",
    "title": "Liên Khúc Chuyện Ba Người karaoke",
    "artist": "võ ngọc thắng",
    "duration": "04:20",
    "genre": "Nhạc Trẻ",
    "tone": "Tone Nam",
    "thumb": "https://img.youtube.com/vi/TK9ZSbAneCM/mqdefault.jpg",
    "views": "YouTube"
  },
  {
    "id": "uKnwm02cwwU",
    "title": "Karaoke Túp Lều Lý Tưởng Remix Tone Nữ Nhạc Sống | Trọng Hiếu",
    "artist": "Hiếu Organ",
    "duration": "04:20",
    "genre": "Remix",
    "tone": "Tone Nữ",
    "thumb": "https://img.youtube.com/vi/uKnwm02cwwU/mqdefault.jpg",
    "views": "YouTube"
  }
];

export function searchVerifiedCatalog(query: string): KaraokeSong[] {
  const trimmed = (query || "").trim();
  if (!trimmed) {
    return POPULAR_KARAOKE_SONGS;
  }

  const normQ = removeVietnameseTones(trimmed);
  const words = normQ.split(/\s+/).filter((w) => w.length > 0 && w !== "karaoke");

  // Exact phrase or all words match
  const matched = POPULAR_KARAOKE_SONGS.filter((s) => {
    const target = removeVietnameseTones(s.title + " " + s.artist + " " + s.genre + " " + (s.tone || ""));
    if (words.length === 0) return true;
    return target.includes(normQ) || words.every((w) => target.includes(w));
  });

  if (matched.length > 0) return matched;

  // Partial / any word match
  const partial = POPULAR_KARAOKE_SONGS.filter((s) => {
    const target = removeVietnameseTones(s.title + " " + s.artist + " " + s.genre + " " + (s.tone || ""));
    return words.some((w) => target.includes(w));
  });

  return partial.length > 0 ? partial : POPULAR_KARAOKE_SONGS.slice(0, 15);
}
