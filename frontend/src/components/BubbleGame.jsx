import { useState, useEffect, useRef, useCallback } from 'react';

const COLORS = ['#93C5FD', '#C4B5FD', '#6EE7B7', '#FCA5A5', '#FDE68A', '#F9A8D4', '#A5F3FC'];
const EMOJIS = ['😊', '⭐', '🌈', '💚', '🫧', '✨', '🌸', '💙', '🌻', '🦋'];

let idCounter = 0;

function makeBubble() {
  return {
    id: ++idCounter,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 52 + Math.random() * 58,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    dx: (Math.random() - 0.5) * 0.25,
    dy: (Math.random() - 0.5) * 0.25,
  };
}

export default function BubbleGame({ onBack }) {
  const [bubbles, setBubbles] = useState(() => Array.from({ length: 9 }, makeBubble));
  const [score, setScore] = useState(0);
  const [pops, setPops] = useState([]);
  const animRef = useRef(null);
  const bubblesRef = useRef(bubbles);

  // Sync ref
  useEffect(() => { bubblesRef.current = bubbles; }, [bubbles]);

  // Move bubbles via rAF
  useEffect(() => {
    let last = performance.now();
    const tick = (now) => {
      const delta = Math.min((now - last) / 16, 3);
      last = now;
      setBubbles(prev =>
        prev.map(b => {
          let nx = b.x + b.dx * delta;
          let ny = b.y + b.dy * delta;
          let dx = b.dx;
          let dy = b.dy;
          if (nx < 3 || nx > 94) { dx = -dx; nx = Math.max(3, Math.min(94, nx)); }
          if (ny < 3 || ny > 88) { dy = -dy; ny = Math.max(3, Math.min(88, ny)); }
          return { ...b, x: nx, y: ny, dx, dy };
        })
      );
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const popBubble = useCallback((id, x, y) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 1);
    // Add pop effect
    const popId = ++idCounter;
    setPops(prev => [...prev, { id: popId, x, y }]);
    setTimeout(() => setPops(prev => prev.filter(p => p.id !== popId)), 500);
    // Respawn after short delay
    setTimeout(() => setBubbles(prev => [...prev, makeBubble()]), 1200);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col select-none">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-white/60 backdrop-blur-sm">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800 text-2xl font-bold">‹</button>
        <h2 className="font-black text-gray-700 text-lg">Revienta Burbujas 🫧</h2>
        <div className="bg-purple-600 text-white font-black px-4 py-1 rounded-full text-sm">
          ✨ {score}
        </div>
      </div>

      {/* Play area */}
      <div className="flex-1 relative overflow-hidden">
        {bubbles.map(b => (
          <button
            key={b.id}
            onPointerDown={(e) => {
              e.preventDefault();
              popBubble(b.id, b.x, b.y);
            }}
            className="absolute flex items-center justify-center rounded-full active:scale-90 cursor-pointer touch-none"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              backgroundColor: b.color + 'AA',
              border: `3px solid ${b.color}`,
              boxShadow: `0 4px 20px ${b.color}66, inset 0 -4px 10px ${b.color}33`,
              transform: 'translate(-50%, -50%)',
              transition: 'transform 0.1s',
            }}
          >
            <span style={{ fontSize: b.size * 0.38 }}>{b.emoji}</span>
          </button>
        ))}

        {/* Pop effects */}
        {pops.map(p => (
          <div
            key={p.id}
            className="absolute pointer-events-none text-3xl animate-ping"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: 'translate(-50%, -50%)',
              animationDuration: '0.5s',
            }}
          >
            ✨
          </div>
        ))}

        {/* Hint */}
        <div className="absolute bottom-6 inset-x-0 text-center pointer-events-none">
          <p className="text-gray-400/60 font-black text-sm">¡Toca las burbujas!</p>
        </div>
      </div>
    </div>
  );
}
