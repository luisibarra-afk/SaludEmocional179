import { useState, useEffect, useRef } from 'react';

const PHASES = [
  { label: 'Inhala', instruction: 'Respira profundo por la nariz', duration: 4, color: '#60A5FA', scale: 1.45 },
  { label: 'Mantén', instruction: 'Aguanta el aire suavemente', duration: 7, color: '#A78BFA', scale: 1.45 },
  { label: 'Exhala', instruction: 'Suelta el aire por la boca', duration: 8, color: '#34D399', scale: 0.85 },
];

export default function BreathingGame({ onBack }) {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount] = useState(PHASES[0].duration);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          const next = (phaseRef.current + 1) % PHASES.length;
          phaseRef.current = next;
          if (next === 0) setCycles(c => c + 1);
          setPhaseIdx(next);
          return PHASES[next].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running]);

  const stop = () => {
    setRunning(false);
    phaseRef.current = 0;
    setPhaseIdx(0);
    setCount(PHASES[0].duration);
  };

  const phase = PHASES[phaseIdx];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-between p-6">
      <div className="w-full flex items-center justify-between">
        <button onClick={onBack} className="text-white/50 hover:text-white text-3xl font-bold transition-colors">‹</button>
        <h2 className="text-white font-black text-xl">Respiración 4-7-8</h2>
        <div className="bg-white/10 rounded-full px-3 py-1 text-white text-sm font-bold">
          {cycles} ciclos
        </div>
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* Animated circle */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow */}
          <div
            className="absolute rounded-full transition-all duration-1000"
            style={{
              width: '260px',
              height: '260px',
              backgroundColor: phase.color + '15',
              transform: running ? `scale(${phase.scale * 1.15})` : 'scale(1)',
              boxShadow: running ? `0 0 80px ${phase.color}40` : 'none',
            }}
          />
          {/* Main circle */}
          <div
            className="relative rounded-full flex items-center justify-center transition-all duration-1000"
            style={{
              width: '200px',
              height: '200px',
              border: `4px solid ${phase.color}`,
              backgroundColor: phase.color + '20',
              transform: running ? `scale(${phase.scale})` : 'scale(1)',
              boxShadow: `0 0 40px ${phase.color}60`,
            }}
          >
            <div className="text-center">
              <p className="text-white font-black text-6xl leading-none">{count}</p>
              <p className="text-white/90 font-bold text-xl mt-1">{phase.label}</p>
            </div>
          </div>
        </div>

        <p className="text-white/70 font-semibold text-center">{phase.instruction}</p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        {!running ? (
          <button
            onClick={() => setRunning(true)}
            className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl text-lg hover:scale-105 active:scale-95 transition-transform shadow-2xl"
          >
            Comenzar 🌬️
          </button>
        ) : (
          <button
            onClick={stop}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-2xl transition-colors"
          >
            Detener
          </button>
        )}
        <p className="text-white/40 text-xs text-center">
          Inhala 4 s → Mantén 7 s → Exhala 8 s — Repite 3-4 veces
        </p>
      </div>
    </div>
  );
}
