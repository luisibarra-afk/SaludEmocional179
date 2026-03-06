import { useState, useEffect, useRef } from 'react';

const AFFIRMATIONS = [
  '¡Eres capaz de superar esto! 💪',
  'Respira... este momento pasará 🌸',
  'Estás haciendo lo mejor que puedes ⭐',
  'Eres más fuerte de lo que crees 🦋',
  'Cada día aprendes algo nuevo 🌱',
  'Tu esfuerzo cuenta y vale mucho 💛',
  'Está bien pedir ayuda 🤝',
  'Este es tu momento de calma ☁️',
  'Tú puedes con esto 🌈',
  '¡Confía en ti! Vas muy bien 🎯',
  'Tu mente merece descanso 🧘',
  'Eres especial y único 🌟',
];

let cloudId = 0;

function makeCloud(startX = -25) {
  return {
    id: ++cloudId,
    y: 8 + Math.random() * 72,
    x: startX,
    speed: 0.012 + Math.random() * 0.012,
    scale: 0.7 + Math.random() * 0.7,
    affirmation: AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)],
  };
}

export default function CloudsGame({ onBack }) {
  const [clouds, setClouds] = useState(() => [
    { ...makeCloud(15) },
    { ...makeCloud(45) },
    { ...makeCloud(75) },
  ]);
  const [popup, setPopup] = useState(null);
  const animRef = useRef(null);
  const popupTimer = useRef(null);

  useEffect(() => {
    let last = performance.now();
    const tick = (now) => {
      const delta = Math.min((now - last) / 16, 3);
      last = now;
      setClouds(prev => {
        let next = prev.map(c => ({ ...c, x: c.x + c.speed * delta }));
        const gone = next.filter(c => c.x > 130);
        next = next.filter(c => c.x <= 130);
        gone.forEach(() => next.push(makeCloud()));
        return next;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const tapCloud = (cloud, e) => {
    e.stopPropagation();
    if (popupTimer.current) clearTimeout(popupTimer.current);
    setPopup(cloud.affirmation);
    popupTimer.current = setTimeout(() => setPopup(null), 3500);
  };

  return (
    <div
      className="min-h-screen flex flex-col select-none overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #38bdf8 0%, #7dd3fc 40%, #bae6fd 70%, #e0f2fe 100%)' }}
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3 bg-white/30 backdrop-blur-sm">
        <button onClick={onBack} className="text-sky-800 hover:text-sky-900 text-2xl font-bold">‹</button>
        <h2 className="font-black text-sky-900 text-lg">Nubes que Pasan ☁️</h2>
      </div>

      <div className="flex-1 relative">
        {/* Sun */}
        <div
          className="absolute top-3 right-8 text-6xl"
          style={{ filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.5))' }}
        >
          ☀️
        </div>

        {/* Birds */}
        <div className="absolute top-16 left-10 text-2xl opacity-60" style={{ animation: 'float 4s ease-in-out infinite' }}>🐦</div>
        <div className="absolute top-24 left-28 text-xl opacity-40" style={{ animation: 'float 5s ease-in-out infinite 1s' }}>🐦</div>

        {/* Clouds */}
        {clouds.map(c => (
          <button
            key={c.id}
            onClick={(e) => tapCloud(c, e)}
            className="absolute flex items-center justify-center rounded-full active:scale-95 transition-transform"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              transform: `translate(-50%, -50%) scale(${c.scale})`,
              fontSize: '4.5rem',
              lineHeight: 1,
              background: 'transparent',
              border: 'none',
              filter: 'drop-shadow(0 4px 12px rgba(186,230,253,0.6))',
            }}
          >
            ☁️
          </button>
        ))}

        {/* Affirmation popup */}
        {popup && (
          <div
            className="absolute inset-x-6 z-10 bg-white/95 backdrop-blur-sm rounded-2xl p-5 text-center shadow-xl border-2 border-sky-200"
            style={{ top: '38%', transform: 'translateY(-50%)' }}
          >
            <p className="text-lg font-black text-sky-700 leading-snug">{popup}</p>
          </div>
        )}

        {/* Ground */}
        <div className="absolute bottom-0 inset-x-0 flex justify-center gap-4 pb-2">
          <span className="text-3xl">🌳</span>
          <span className="text-4xl">🌲</span>
          <span className="text-2xl">🌿</span>
          <span className="text-4xl">🌲</span>
          <span className="text-3xl">🌳</span>
        </div>

        {/* Hint */}
        <div className="absolute bottom-12 inset-x-0 text-center pointer-events-none">
          <p className="text-sky-700/70 font-semibold text-sm">Toca una nube para un mensaje 💙</p>
        </div>
      </div>
    </div>
  );
}
