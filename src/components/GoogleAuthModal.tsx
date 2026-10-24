import React, { useState } from 'react';
import {
  ShieldCheck,
  Globe,
  ExternalLink,
  X,
  CheckCircle2,
  AlertTriangle,
  MousePointer,
  HelpCircle,
  Tv,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isInteractiveMode: boolean;
  onToggleInteractiveMode: () => void;
  embedDomain?: 'youtube-nocookie.com' | 'youtube.com';
  onChangeEmbedDomain?: (domain: 'youtube-nocookie.com' | 'youtube.com') => void;
}

export const GoogleAuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isInteractiveMode,
  onToggleInteractiveMode,
  embedDomain = 'youtube.com',
  onChangeEmbedDomain,
}) => {
  const [showWebviewLogin, setShowWebviewLogin] = useState(false);

  if (!isOpen) return null;

  const handleOpenGoogleLogin = () => {
    // Open Google / YouTube authentication page
    const loginUrl =
      'https://accounts.google.com/ServiceLogin?service=youtube&continue=https%3A%2F%2Fwww.youtube.com';
    window.open(loginUrl, '_blank', 'width=500,height=650');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#18181b] border-2 border-red-500/70 w-full max-w-xl rounded-3xl p-6 text-white shadow-[0_0_80px_rgba(239,68,68,0.25)] flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Đăng Nhập Google / Khắc Phục CAPTCHA TV
              </h3>
              <p className="text-[11px] text-neutral-400">
                Xử lý triệt để lỗi &quot;Xác minh bạn không phải robot&quot; trên Android TV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4 text-xs">
          {/* Method 1: Clean Domain (youtube-nocookie.com) */}
          <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-white">
                  Cách 1: Domain Embed Sạch (Khuyên dùng)
                </span>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold px-2 py-0.5 rounded-full">
                Đang bật
              </span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Ứng dụng phát video thông qua domain <code className="text-red-400 font-mono">youtube-nocookie.com</code> không chứa cookie rác hay kiểm tra bot để giảm thiểu 99% lỗi xác minh CAPTCHA.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onChangeEmbedDomain?.('youtube-nocookie.com')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  embedDomain === 'youtube-nocookie.com'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>youtube-nocookie.com (Sạch)</span>
              </button>
              <button
                onClick={() => onChangeEmbedDomain?.('youtube.com')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  embedDomain === 'youtube.com'
                    ? 'bg-red-600 text-white shadow'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <span>youtube.com (Gốc)</span>
              </button>
            </div>
          </div>

          {/* Method 2: Sign-in Google Account once into WebView */}
          <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-sm text-white">
                Cách 2: Đăng Nhập Tài Khoản Google / YouTube
              </span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Đăng nhập 1 tài khoản Google bất kỳ (hoặc tài khoản phụ) vào TV. WebView sẽ tự lưu Cookie phiên đăng nhập của Google và YouTube sẽ không bao giờ bắt xác minh Robot nữa!
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleOpenGoogleLogin}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở Trang Đăng Nhập Google</span>
              </button>
              <button
                onClick={() => setShowWebviewLogin(!showWebviewLogin)}
                className="py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl border border-neutral-700 flex items-center justify-center gap-2 transition"
              >
                <span>{showWebviewLogin ? 'Ẩn khung đăng nhập' : 'Hiện khung đăng nhập tại đây'}</span>
              </button>
            </div>

            {showWebviewLogin && (
              <div className="mt-3 border border-neutral-700 rounded-xl overflow-hidden bg-white h-72">
                <iframe
                  src="https://accounts.google.com/ServiceLogin?service=youtube&passive=true&continue=https%3A%2F%2Fwww.youtube.com"
                  title="Google Login"
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>
            )}
          </div>

          {/* Method 3: Direct Touch / Mouse Interactive Mode to solve CAPTCHA */}
          <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-white">
                  Cách 3: Chế Độ Tương Tác Chuột Trực Tiếp (Bấm CAPTCHA)
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isInteractiveMode
                    ? 'bg-amber-950 text-amber-300 border border-amber-600'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {isInteractiveMode ? 'ĐANG BẬT' : 'ĐANG TẮT'}
              </span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Nếu màn hình TV hiện khung kiểm tra robot, hãy bật chế độ này để dùng chuột/remote TV nhấp thẳng vào ô &quot;Tôi không phải người máy&quot; hoặc nút &quot;Đăng nhập&quot; ngay trên khung video!
            </p>
            <button
              onClick={onToggleInteractiveMode}
              className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                isInteractiveMode
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>
                {isInteractiveMode
                  ? 'Tắt tương tác trực tiếp (Trở lại chế độ hát chuẩn)'
                  : 'Bật tương tác trực tiếp (Cho phép bấm vào video giải CAPTCHA)'}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
