import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Tv, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA / standalone app, hide button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Android TV flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Cài Đặt App TV</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>Cài trên iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#1c1917] p-5 border border-neutral-700 shadow-2xl text-white">
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>📱 Cài Đặt Lên Màn Hình Chính iOS</span>
              </h3>
              <p className="mt-2 text-xs text-neutral-300 space-y-2">
                1. Bấm nút <b>Chia sẻ (Share)</b> ở thanh công cụ Safari.<br />
                2. Cuộn xuống và chọn <b>"Thêm vào Màn hình chính" (Add to Home Screen)</b>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-500"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
