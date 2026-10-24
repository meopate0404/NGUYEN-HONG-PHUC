import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: './', // Đường dẫn tương đối giúp app nhận đúng file ở GitHub Pages / WebView[cite: 4, 10]
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'banner.png'],
        manifest: {
          id: './', // 👈 ĐÃ SỬA: Thay '/' bằng './'
          name: 'Oanh Điền Karaoke TV',
          short_name: 'OanhDienTV',
          description: 'Ứng dụng hát Karaoke chuẩn Android TV & điều khiển bằng Remote điện thoại qua mã QR.',
          theme_color: '#0f0f0f',
          background_color: '#0f0f0f',
          display: 'standalone',
          orientation: 'any',
          start_url: './', // 👈 ĐÃ SỬA: Thay '/' bằng './'
          scope: './', // 👈 ĐÃ SỬA: Thay '/' bằng './'
          categories: ['entertainment', 'music'],
          icons: [
            {
              src: 'pwa-192x192.png', // 👈 ĐÃ SỬA: Xóa dấu '/' ở đầu
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png', // 👈 ĐÃ SỬA: Xóa dấu '/' ở đầu
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-maskable-512x512.png', // 👈 ĐÃ SỬA: Xóa dấu '/' ở đầu
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          navigateFallback: 'index.html', // 👈 ĐÃ SỬA: Xóa dấu '/' ở đầu
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      hmr: false,
    },
  };
});
