import React, { useState } from 'react';
import {
  Tv,
  Download,
  Smartphone,
  CheckCircle,
  Copy,
  ExternalLink,
  MonitorPlay,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
  roomCode: string;
}

export const AndroidTVInstallerModal: React.FC<Props> = ({ isOpen, onClose, appUrl, roomCode }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'downloader' | 'apk' | 'pwa' | 'remote'>('downloader');

  if (!isOpen) return null;

  const copyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAndroidTVManifest = () => {
    const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.oanhdien.karaoketv">

    <!-- Android TV Leanback Requirements -->
    <uses-feature android:name="android.software.leanback" android:required="true" />
    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:banner="@drawable/banner"
        android:label="Oanh Điền Karaoke TV"
        android:theme="@style/Theme.Leanback"
        android:hardwareAccelerated="true">
        
        <activity
            android:name=".MainActivity"
            android:screenOrientation="landscape"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize"
            android:exported="true">
            <!-- Android TV Launcher Intent -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

    const blob = new Blob([manifestContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AndroidManifest-AndroidTV.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const pwabuilderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(appUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#18181b] border border-neutral-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center border border-white/20">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Cài Đặt & Hướng Dẫn Android TV
              </h2>
              <p className="text-xs text-red-100">Oanh Điền Karaoke • Hướng dẫn cài đặt và sử dụng remote</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/60 px-4 pt-2 gap-2 text-sm overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('downloader')}
            className={`pb-3 px-3 font-medium transition border-b-2 flex items-center gap-2 ${
              activeTab === 'downloader'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Download className="w-4 h-4 text-red-400" />
            Cài Downloader TV
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-3 px-3 font-medium transition border-b-2 flex items-center gap-2 ${
              activeTab === 'apk'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Tải APK Android
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-3 px-3 font-medium transition border-b-2 flex items-center gap-2 ${
              activeTab === 'pwa'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <MonitorPlay className="w-4 h-4 text-blue-400" />
            PWA Trình Duyệt TV
          </button>
          <button
            onClick={() => setActiveTab('remote')}
            className={`pb-3 px-3 font-medium transition border-b-2 flex items-center gap-2 ${
              activeTab === 'remote'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            Phím Tắt Remote
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-neutral-200 text-sm">

          {activeTab === 'downloader' && (
            <div className="space-y-4">
              <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 flex gap-4 items-start">
                <div className="text-2xl">📺</div>
                <div>
                  <h3 className="font-semibold text-white text-base">Cài đặt trực tiếp trên Android TV qua app "Downloader by AFTVnews"</h3>
                  <p className="text-neutral-300 text-xs mt-1">
                    Dùng app miễn phí <b>Downloader</b> để mở và cài app karaoke trực tiếp lên tivi Sony, TCL, Casper, Mi Box, Chromecast.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <div>
                    <div className="font-semibold text-white">Mở Google Play Store trên Android TV</div>
                    <div className="text-xs text-neutral-400">Tìm kiếm và cài đặt ứng dụng <b>Downloader by AFTVnews</b>.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <div className="flex-1">
                    <div className="font-semibold text-white">Nhập địa chỉ Web App vào ô URL trong Downloader:</div>
                    <div className="mt-2 flex items-center gap-2 bg-black p-2 rounded border border-neutral-700">
                      <code className="text-xs text-amber-400 select-all break-all flex-1">{appUrl}</code>
                      <button
                        onClick={copyUrl}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded font-medium flex items-center gap-1 shrink-0"
                      >
                        {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <div>
                    <div className="font-semibold text-white">Bấm "Go" và Thêm vào Màn hình chính</div>
                    <div className="text-xs text-neutral-400">
                      Sau khi trang mở, bấm Menu chọn <b>"Add to Home Screen"</b> để mở full màn hình như app gốc.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-4 flex gap-4 items-start">
                <div className="text-2xl">📦</div>
                <div>
                  <h3 className="font-semibold text-white text-base">Đóng gói thành File APK Android TV (TWA / WebAPK)</h3>
                  <p className="text-neutral-300 text-xs mt-1">
                    Ứng dụng đã được tích hợp đầy đủ <b>PWA Manifest</b>, <b>Leanback Banner 16:9</b> và đạt chuẩn 100% Android TV.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white text-base">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      Tạo APK Trực Tuyến 1-Click
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">
                      Sử dụng công cụ chính thức PWABuilder để tự động xuất file <b>.apk</b> chuẩn Android TV cài qua USB.
                    </p>
                  </div>
                  <a
                    href={pwabuilderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white py-2.5 px-4 rounded-lg font-bold text-xs shadow-lg transition"
                  >
                    <span>Mở PWABuilder Tạo File APK</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white text-base">
                      <Download className="w-5 h-5 text-blue-400" />
                      Tải File AndroidManifest.xml
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">
                      Dành cho lập trình viên Android Studio: Chứa định nghĩa <code className="text-amber-300">android.software.leanback</code>.
                    </p>
                  </div>
                  <button
                    onClick={downloadAndroidTVManifest}
                    className="mt-4 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 px-4 rounded-lg font-bold text-xs border border-neutral-700 transition"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Tải AndroidManifest-TV.xml</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-4 flex gap-4 items-start">
                <div className="text-2xl">🌐</div>
                <div>
                  <h3 className="font-semibold text-white text-base">Cài đặt trực tiếp qua Trình duyệt Tivi (PWA)</h3>
                  <p className="text-neutral-300 text-xs mt-1">
                    Mở trình duyệt trên TV (Chrome, JioPages, BrowseHere) → truy cập link <b className="text-red-400">{appUrl}</b> → chọn Cài đặt ứng dụng.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'remote' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                🎮 Bảng Phím Tắt Điều Khiển Remote Android TV
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 flex justify-between items-center">
                  <span className="text-neutral-400">Chọn / Tìm kiếm:</span>
                  <span className="px-2 py-1 bg-neutral-800 text-amber-400 rounded font-mono font-bold">Phím F hoặc OK</span>
                </div>
                <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 flex justify-between items-center">
                  <span className="text-neutral-400">Tạm dừng / Hát tiếp:</span>
                  <span className="px-2 py-1 bg-neutral-800 text-amber-400 rounded font-mono font-bold">Phím Space / Play</span>
                </div>
                <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 flex justify-between items-center">
                  <span className="text-neutral-400">Qua bài (Next):</span>
                  <span className="px-2 py-1 bg-neutral-800 text-amber-400 rounded font-mono font-bold">Phím N hoặc &gt;&gt;</span>
                </div>
                <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 flex justify-between items-center">
                  <span className="text-neutral-400">Hát lại từ đầu:</span>
                  <span className="px-2 py-1 bg-neutral-800 text-amber-400 rounded font-mono font-bold">Phím R</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-900 px-6 py-4 border-t border-neutral-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-neutral-400">
            Hỗ trợ Android TV, Google TV, Samsung Tizen & LG WebOS
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-xs transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
