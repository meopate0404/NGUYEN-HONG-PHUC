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

      // Thử gọi Invidious API trước (ổn định hơn cho Smart TV)
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
        console.warn('Invidious failed, trying Piped fallback...');
      }

      // Nếu Invidious không có kết quả, gọi dự phòng qua Piped API
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
