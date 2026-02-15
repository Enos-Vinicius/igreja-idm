import { useEffect, useState } from 'react';
import { CheckCircle2, Star, Trophy, X } from 'lucide-react';
import './BirthdayConfetti.css';

interface TourCompleteConfettiProps {
  show: boolean;
  memberName: string;
  onComplete?: () => void;
}

const TourCompleteConfetti = ({ show, memberName, onComplete }: TourCompleteConfettiProps) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number; duration: number; size: number }>>([]);

  useEffect(() => {
    if (show) {
      // Gerar 40 confetes com posições aleatórias
      const newConfetti = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C'][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.5,
        duration: 4 + Math.random() * 2,
        size: 8 + Math.random() * 6,
      }));
      setConfetti(newConfetti);
    }
  }, [show]);

  if (!show) return null;

  return (
    <>
      {/* Overlay escuro */}
      <div
        className="fixed inset-0 bg-black/70 z-50 animate-fade-in"
        onClick={onComplete}
      />

      {/* Card de parabéns */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="birthday-card animated-gradient text-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 pointer-events-auto animate-scale-in relative">
          {/* Botão fechar */}
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors duration-200"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-4 animate-cake-bounce">
            <Trophy className="h-20 w-20 mx-auto mb-4 text-yellow-300" />
          </div>

          <h2 className="text-3xl font-bold text-center mb-2">
            🎉 Parabéns! 🎉
          </h2>
          <p className="text-xl text-center mb-4 font-semibold">
            {memberName.split(' ')[0]}
          </p>
          <p className="text-center text-white/90 mb-6">
            Você concluiu o tour da área de membro! Agora você já conhece todas as funcionalidades disponíveis.
            Aproveite tudo que o sistema tem a oferecer! 🙏✨
          </p>

          <div className="flex items-center justify-center gap-4">
            <Star className="h-8 w-8 animate-bounce text-yellow-300" />
            <CheckCircle2 className="h-8 w-8 animate-pulse text-green-300" />
            <Star className="h-8 w-8 animate-bounce text-yellow-300" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>

      {/* Confetes caindo */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece fixed z-50 pointer-events-none"
          style={{
            left: `${piece.x}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}

      {/* Balões flutuantes */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`balloon-${i}`}
          className="balloon fixed z-40 pointer-events-none"
          style={{
            left: `${(i * 12) + 10}%`,
            animationDelay: `${i * 0.3}s`,
          }}
        >
          <div
            className="balloon-body w-12 h-14 rounded-full relative"
            style={{
              backgroundColor: ['#FF69B4', '#87CEEB', '#FFD700', '#98FB98'][i % 4],
              boxShadow: '0 0 20px rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="balloon-string absolute bottom-0 left-1/2 transform -translate-x-1/2"
              style={{
                width: '2px',
                height: '30px',
                backgroundColor: '#666',
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
};

export default TourCompleteConfetti;
