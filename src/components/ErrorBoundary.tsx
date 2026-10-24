import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Crash Caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-lg w-full bg-[#161619] border-2 border-red-600/70 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500 mb-4 animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black text-white mb-2">
              ĐÃ XẢY RA SỰ CỐ TRÊN TV
            </h1>
            <p className="text-sm text-neutral-400 mb-6 max-w-sm">
              Ứng dụng gặp lỗi tạm thời khi hiển thị giao diện. Bạn có thể bấm nút bên dưới bằng Remote TV để khắc phục ngay:
            </p>

            {this.state.error && (
              <div className="w-full bg-black/60 rounded-xl p-3.5 border border-neutral-800 text-left font-mono text-xs text-red-300 max-h-32 overflow-y-auto mb-6 break-words">
                <span className="font-bold text-neutral-400">Chi tiết lỗi: </span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-3 px-5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/50 transition flex items-center justify-center gap-2 text-sm focus:ring-4 focus:ring-red-400 focus:outline-none"
                autoFocus
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tải Lại Trang (Reload)</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:flex-1 py-3 px-5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-semibold rounded-xl border border-neutral-700 transition flex items-center justify-center gap-2 text-sm focus:ring-2 focus:ring-neutral-400 focus:outline-none"
              >
                <Home className="w-4 h-4" />
                <span>Xóa Cache & Khởi Động Lại</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
