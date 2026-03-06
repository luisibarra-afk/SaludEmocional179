import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pockets = [
  {
    id: 'diario',
    label: 'Mi Diario',
    icon: '📔',
    desc: 'Escribe cómo te sientes hoy',
    gradient: 'from-purple-400 to-pink-400',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    path: '/diario',
  },
  {
    id: 'relajacion',
    label: 'Zona de Calma',
    icon: '🫧',
    desc: 'Juegos para respirar y relajarte',
    gradient: 'from-blue-400 to-cyan-400',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    path: '/relajacion',
  },
  {
    id: 'logros',
    label: 'Mis Logros',
    icon: '⭐',
    desc: 'Tus stickers y medallas',
    gradient: 'from-amber-400 to-orange-400',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    path: '/logros',
  },
];

const quotes = [
  'Cuidar cómo te sientes es la tarea más importante.',
  'Tus emociones son válidas. Escucharlas te hace más fuerte.',
  'Un paso a la vez. Hoy también puedes lograrlo.',
  'Está bien pedir ayuda. Todos la necesitamos a veces.',
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const quote = quotes[new Date().getDay() % quotes.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-blue-50">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{user?.avatar || '🎒'}</span>
          <div>
            <p className="font-black text-gray-800 leading-none">
              ¡Hola, {user?.name?.split(' ')[0]}!
            </p>
            <p className="text-xs text-gray-500">{user?.grade}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-gray-600 font-semibold px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Salir
        </button>
      </div>

      <div className="max-w-md mx-auto p-5">
        {/* Streak badge */}
        {user?.streak > 0 && (
          <div className="bg-amber-100 border-2 border-amber-200 rounded-2xl p-3 mb-5 flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="font-black text-amber-800">{user.streak} días seguidos</p>
              <p className="text-xs text-amber-600">¡Sigue escribiendo en tu diario!</p>
            </div>
            {user.achievements?.length > 0 && (
              <div className="ml-auto flex gap-1">
                {user.achievements.slice(-3).map((a, i) => (
                  <span key={i} className="text-xl">⭐</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Backpack visual */}
        <div className="text-center py-4">
          <span className="text-9xl inline-block float-animation">🎒</span>
          <h2 className="text-2xl font-black text-green-800 mt-2">Tu Mochila</h2>
          <p className="text-gray-500 text-sm">¿Qué bolsillo abres hoy?</p>
        </div>

        {/* Pockets */}
        <div className="space-y-3 mt-2">
          {pockets.map(pocket => (
            <button
              key={pocket.id}
              onClick={() => navigate(pocket.path)}
              className={`w-full ${pocket.bg} border-2 ${pocket.border} rounded-2xl p-4 flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-sm text-left`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pocket.gradient} flex items-center justify-center text-3xl shadow-md flex-shrink-0`}>
                {pocket.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-800 text-lg">{pocket.label}</p>
                <p className="text-gray-500 text-sm">{pocket.desc}</p>
              </div>
              <span className="text-gray-400 text-2xl font-light">›</span>
            </button>
          ))}
        </div>

        {/* Daily quote */}
        <div className="mt-6 bg-white border-2 border-green-100 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-2">💚</p>
          <p className="text-green-700 font-semibold text-sm italic">"{quote}"</p>
        </div>
      </div>
    </div>
  );
}
