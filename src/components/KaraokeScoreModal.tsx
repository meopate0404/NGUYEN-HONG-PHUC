import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { sfx } from '../utils/audioEffects';
import { Sparkles, Trophy, Music, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  songTitle: string;
  onNext: () => void;
  onClose: () => void;
}

const COMMENTS = [
  '🌟 Đẳng Cấp Ca Sĩ! Giọng hát làm say đắm lòng người!',
  '🎤 Quá Xuất Sắc! Chuẩn từng nốt nhạc, rung rinh cả xóm!',
  '🔥 Quá Cháy! Quẩy hết mình, cảm xúc dâng trào!',
  '👏 Hát Quá Hay! Giọng ca đầy nội lực và truyền cảm!',
  '❤️ Tuyệt Đỉnh Trữ Tình! Hát như nuốt đĩa CD!',
];

export const KaraokeScoreModal: React.FC<Props> = ({ isOpen, songTitle, onNext, onClose }) => {
  const [score, setScore] = useState(96);
  const [comment, setComment] = useState('');
  const [countdown, setCountdown] = useState(7);

  useEffect(() => {
    if (isOpen) {
      const generatedScore = Math.floor(Math.random() * 8) + 93; // 93 to 100
      setScore(generatedScore);
      setComment(COMMENTS[Math.floor(Math.random() * COMMENTS.length)]);
      setCountdown(7);

      // Play fanfare & applause
      sfx.playScoreFanfare();

      // Launch Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#ec4899'],
        });
      } catch (err) {
        console.error(err);
      }

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onNext();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in zoom-in-95 duration-300">
      <div className="relative bg-gradient-to-b from-[#2a1215] via-[#1c0f12] to-[#121214] border-2 border-red-500/80 w-full max-w-xl rounded-3xl p-8 text-center shadow-[0_0_80px_rgba(239,68,68,0.4)] flex flex-col items-center">
        {/* Glowing badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/30 border border-red-500/60 text-red-300 text-xs font-bold uppercase tracking-widest mb-4">
          <Trophy className="w-4 h-4 text-amber-400" />
          Chấm Điểm Oanh Điền Karaoke
        </div>

        <h3 className="text-sm text-neutral-300 truncate max-w-md font-medium mb-2">
          {songTitle || 'Bài hát vừa hoàn thành'}
        </h3>

        {/* Animated Score Circle */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-44 h-44 rounded-full bg-gradient-to-tr from-amber-500 via-red-500 to-rose-600 p-1.5 animate-spin-slow">
            <div className="w-full h-full rounded-full bg-[#180a0c] flex flex-col items-center justify-center border border-red-500/40">
              <span className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 drop-shadow-md">
                {score}
              </span>
              <span className="text-xs uppercase font-extrabold text-red-400 tracking-widest mt-1">
                ĐIỂM SỐ
              </span>
            </div>
          </div>
        </div>

        {/* Verdict Comment */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 my-2 max-w-md">
          <p className="text-lg font-bold text-amber-300 drop-shadow">
            {comment}
          </p>
        </div>

        {/* Next song countdown */}
        <p className="text-xs text-neutral-400 mt-4 flex items-center gap-1.5">
          <span>Chuẩn bị bài kế tiếp sau:</span>
          <span className="text-red-400 font-mono font-bold text-sm bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
            {countdown}s
          </span>
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-6 w-full max-w-xs">
          <button
            onClick={onNext}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition hover:scale-105 active:scale-95"
          >
            <span>Hát Bài Tiếp</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
