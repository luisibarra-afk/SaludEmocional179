import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const allAchievements = [
  {
    id: 'primer_entrada',
    label: '¡Primera entrada!',
    desc: 'Escribiste en tu diario por primera vez',
    icon: '📝',
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
  },
  {
    id: 'semana_constante',
    label: 'Semana constante',
    desc: 'Escribiste 7 días seguidos',
    icon: '🔥',
    bg: 'bg-orange-100',
    border: 'border-orange-300',
  },
  {
    id: 'experto_emocional',
    label: 'Experto Emocional',
    desc: 'Registraste 5 emociones diferentes',
    icon: '🌈',
    bg: 'bg-pink-100',
    border: 'border-pink-300',
  },
  {
    id: 'escritor',
    label: 'Gran Escritor',
    desc: 'Escribiste 30 entradas en tu diario',
    icon: '✍️',
    bg: 'bg-green-100',
    border: 'border-green-300',
  },
  {
    id: 'zen',
    label: 'Zen Total',
    desc: 'Practicaste respiración 5 veces',
    icon: '🧘',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
  },
  {
    id: 'explorador',
    label: 'Explorador',
    desc: 'Visitaste todos los bolsillos de tu mochila',
    icon: '🗺️',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
  },
];

export default function Achievements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userAchievements = user?.achievements || [];

  const unlocked = allAchievements.filter(a => userAchievements.includes(a.id));
  const locked = allAchievements.filter(a => !userAchievements.includes(a.id));
  const percent = Math.round((unlocked.length / allAchievements.length) * 100);

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="bg-white shadow-sm p-4 flex items-center gap-3 sticky top-0">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">‹</button>
        <h1 className="text-xl font-black text-gray-800">⭐ Mis Logros</h1>
      </div>

      <div className="max-w-md mx-auto p-6">
        {/* Stats card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🏆</span>
            <div className="flex-1">
              <p className="font-black text-2xl text-gray-800">
                {unlocked.length} <span className="text-gray-400 text-lg font-bold">/ {allAchievements.length}</span>
              </p>
              <p className="text-gray-500 text-sm">logros desbloqueados</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-xl text-amber-500">🔥 {user?.streak || 0}</p>
              <p className="text-gray-400 text-xs">días seguidos</p>
            </div>
          </div>
        </div>

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <>
            <p className="font-black text-gray-600 mb-3 flex items-center gap-2">
              ✅ Desbloqueados
            </p>
            <div className="space-y-3 mb-6">
              {unlocked.map(a => (
                <div key={a.id} className={`${a.bg} border-2 ${a.border} rounded-2xl p-4 flex items-center gap-4`}>
                  <span className="text-4xl">{a.icon}</span>
                  <div>
                    <p className="font-black text-gray-800">{a.label}</p>
                    <p className="text-xs text-gray-600">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <>
            <p className="font-black text-gray-400 mb-3">🔒 Por descubrir</p>
            <div className="space-y-3">
              {locked.map(a => (
                <div key={a.id} className="bg-gray-100 border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4 opacity-60">
                  <span className="text-4xl grayscale">🔒</span>
                  <div>
                    <p className="font-black text-gray-500">{a.label}</p>
                    <p className="text-xs text-gray-400">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {unlocked.length === 0 && (
          <div className="text-center py-10">
            <span className="text-6xl">🌱</span>
            <p className="text-gray-500 font-bold mt-4">¡Empieza a usar tu mochila para ganar logros!</p>
            <p className="text-gray-400 text-sm mt-1">Escribe en el diario o juega en la Zona de Calma.</p>
          </div>
        )}
      </div>
    </div>
  );
}
