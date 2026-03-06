import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BreathingGame from '../components/BreathingGame';
import BubbleGame from '../components/BubbleGame';
import DoodleGame from '../components/DoodleGame';
import CloudsGame from '../components/CloudsGame';
import GroundingGame from '../components/GroundingGame';

const games = [
  {
    id: 'breathing',
    label: 'Respiración 4-7-8',
    icon: '🌬️',
    desc: 'Calma tu mente en minutos con esta técnica',
    gradient: 'from-blue-400 to-cyan-400',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    id: 'bubbles',
    label: 'Revienta Burbujas',
    icon: '🫧',
    desc: 'Toca las burbujas y desahógate jugando',
    gradient: 'from-purple-400 to-pink-400',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    id: 'doodle',
    label: 'Garabato Libre',
    icon: '🎨',
    desc: 'Dibuja lo que sientes. Sin reglas ni errores',
    gradient: 'from-yellow-400 to-orange-400',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  {
    id: 'clouds',
    label: 'Nubes que Pasan',
    icon: '☁️',
    desc: 'Toca las nubes y recibe mensajes de calma',
    gradient: 'from-sky-400 to-blue-400',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  {
    id: 'grounding',
    label: '5-4-3-2-1 Tierra',
    icon: '🌍',
    desc: 'Usa tus sentidos para volver al presente',
    gradient: 'from-emerald-400 to-teal-400',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
];

export default function Games() {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame === 'breathing') return <BreathingGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'bubbles') return <BubbleGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'doodle') return <DoodleGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'clouds') return <CloudsGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'grounding') return <GroundingGame onBack={() => setActiveGame(null)} />;

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="bg-white shadow-sm p-4 flex items-center gap-3 sticky top-0">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">‹</button>
        <h1 className="text-xl font-black text-gray-800">🫧 Zona de Calma</h1>
      </div>

      <div className="max-w-md mx-auto p-6">
        <p className="text-gray-500 font-semibold text-center mb-6">
          Elige una actividad para relajarte cuando te sientes agitado.
        </p>

        <div className="space-y-4">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={`w-full ${game.bg} border-2 ${game.border} rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-sm text-left`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center text-3xl shadow-md flex-shrink-0`}>
                {game.icon}
              </div>
              <div className="flex-1">
                <p className="font-black text-gray-800 text-lg">{game.label}</p>
                <p className="text-gray-500 text-sm">{game.desc}</p>
              </div>
              <span className="text-gray-400 text-2xl font-light">›</span>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl p-5 text-center shadow-sm border-2 border-blue-100">
          <p className="text-3xl mb-2">💆</p>
          <p className="text-gray-600 font-semibold text-sm">
            Cuando sientas tensión, estos ejercicios activan tu sistema de calma natural.
          </p>
        </div>
      </div>
    </div>
  );
}
