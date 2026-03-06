import { useState } from 'react';

const STEPS = [
  {
    count: 5,
    sense: 'VER',
    emoji: '👀',
    instruction: 'Encuentra 5 cosas que puedas VER ahora mismo',
    hint: 'Mira a tu alrededor con calma...',
    color: 'from-blue-500 to-indigo-500',
    light: 'bg-blue-50',
    accent: 'border-blue-300',
    check: 'bg-blue-600',
  },
  {
    count: 4,
    sense: 'TOCAR',
    emoji: '✋',
    instruction: 'Toca 4 cosas que tengas cerca',
    hint: 'Tu ropa, la silla, la mesa...',
    color: 'from-emerald-500 to-teal-500',
    light: 'bg-emerald-50',
    accent: 'border-emerald-300',
    check: 'bg-emerald-600',
  },
  {
    count: 3,
    sense: 'OÍR',
    emoji: '👂',
    instruction: 'Escucha 3 sonidos a tu alrededor',
    hint: 'Cierra los ojos y escucha...',
    color: 'from-violet-500 to-purple-500',
    light: 'bg-violet-50',
    accent: 'border-violet-300',
    check: 'bg-violet-600',
  },
  {
    count: 2,
    sense: 'OLER',
    emoji: '👃',
    instruction: 'Identifica 2 olores que puedas sentir',
    hint: 'Respira profundo...',
    color: 'from-amber-500 to-orange-500',
    light: 'bg-amber-50',
    accent: 'border-amber-300',
    check: 'bg-amber-600',
  },
  {
    count: 1,
    sense: 'SABOREAR',
    emoji: '👅',
    instruction: 'Nota 1 sabor en tu boca',
    hint: 'Presta atención a tu boca...',
    color: 'from-pink-500 to-rose-500',
    light: 'bg-pink-50',
    accent: 'border-pink-300',
    check: 'bg-pink-600',
  },
];

export default function GroundingGame({ onBack }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [checked, setChecked] = useState([]);
  const [done, setDone] = useState(false);

  const step = STEPS[stepIdx];
  const items = Array.from({ length: step.count }, (_, i) => i);

  const toggle = (i) => {
    setChecked(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const next = () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(s => s + 1);
      setChecked([]);
    } else {
      setDone(true);
    }
  };

  const reset = () => {
    setStepIdx(0);
    setChecked([]);
    setDone(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-8xl mb-4">🌟</div>
        <h2 className="font-black text-gray-800 text-2xl mb-3">¡Muy bien hecho!</h2>
        <p className="text-gray-600 font-semibold mb-2 leading-relaxed max-w-xs">
          Usaste tus 5 sentidos para conectar con el presente.
        </p>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">
          Esta técnica ayuda a tu mente a salir del estrés y volver al aquí y ahora. 💚
        </p>
        <button
          onClick={reset}
          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black px-8 py-4 rounded-2xl text-lg shadow-lg transition-all"
        >
          Repetir ejercicio 🔄
        </button>
        <button onClick={onBack} className="mt-4 text-gray-500 font-semibold text-sm py-2">
          ← Volver a la Zona de Calma
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${step.light} flex flex-col select-none`}>
      {/* Header */}
      <div className="p-4 flex items-center gap-3 bg-white/60 backdrop-blur-sm">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800 text-2xl font-bold">‹</button>
        <h2 className="font-black text-gray-700 text-lg">5-4-3-2-1 Tierra 🌍</h2>
        {/* Progress dots */}
        <div className="ml-auto flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i < stepIdx ? 'bg-gray-600' : i === stepIdx ? 'bg-gray-800 scale-125' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto w-full p-5 flex flex-col flex-1">
        {/* Step card */}
        <div className={`bg-gradient-to-br ${step.color} rounded-2xl p-6 text-white text-center shadow-lg mb-5`}>
          <div className="text-5xl mb-2">{step.emoji}</div>
          <div className="text-5xl font-black mb-1 leading-none">{step.count}</div>
          <p className="font-black text-lg opacity-95">{step.sense}</p>
          <p className="font-semibold text-sm opacity-80 mt-1">{step.instruction}</p>
          <p className="text-xs opacity-60 mt-1 italic">{step.hint}</p>
        </div>

        {/* Tap circles */}
        <p className="text-center text-gray-500 text-sm font-semibold mb-4">
          Toca cada círculo cuando identifiques algo
        </p>
        <div className="flex flex-wrap justify-center gap-4 flex-1 items-center">
          {items.map(i => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`rounded-full flex items-center justify-center font-black text-2xl transition-all active:scale-90 shadow-md ${
                checked.includes(i)
                  ? `${step.check} text-white scale-110`
                  : `bg-white border-2 ${step.accent} text-gray-300`
              }`}
              style={{ width: 72, height: 72 }}
            >
              {checked.includes(i) ? '✓' : i + 1}
            </button>
          ))}
        </div>

        {/* Progress text */}
        <p className="text-center text-gray-400 font-semibold text-sm mt-4">
          {checked.length} de {step.count} identificadas
        </p>

        {/* Next button */}
        <button
          onClick={next}
          disabled={checked.length < step.count}
          className={`mt-5 w-full py-4 rounded-2xl font-black text-lg transition-all ${
            checked.length === step.count
              ? 'bg-gray-800 text-white shadow-lg active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {stepIdx < STEPS.length - 1 ? `Siguiente: ${STEPS[stepIdx + 1].emoji} ${STEPS[stepIdx + 1].sense} →` : '¡Terminar! 🎉'}
        </button>
      </div>
    </div>
  );
}
