import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { AMBITOS, NIVELES } from '../data/actividades'

export default function Progreso() {
  const { estado, getNivel, getProgreso } = useApp()
  const navigate = useNavigate()
  const nivel = getNivel()
  const progreso = getProgreso()
  const totalActividades = AMBITOS.flatMap(a => a.actividades).length

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-5 pt-10 pb-8">
        <h2 className="text-2xl font-bold">Mis Logros ⭐</h2>
        <p className="text-yellow-100 text-sm mt-1">Tu progreso socioemocional</p>
      </div>

      <div className="px-5 mt-5 space-y-5">
        {/* Nivel actual */}
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{nivel.emoji}</div>
            <div>
              <p className="text-sm text-gray-500">Nivel actual</p>
              <h3 className="text-2xl font-bold text-gray-800">{nivel.nombre}</h3>
              <p className="text-yellow-500 font-bold">{estado.xp} XP totales</p>
            </div>
          </div>
          <div className="bg-gray-100 rounded-full h-3">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all" style={{ width: `${progreso}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{Math.round(progreso)}% hacia el siguiente nivel</p>
        </div>

        {/* Ruta de niveles */}
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <h4 className="font-bold text-gray-700 mb-3">Ruta de crecimiento</h4>
          <div className="flex justify-between">
            {NIVELES.map((n, i) => {
              const alcanzado = estado.xp >= n.minXP
              return (
                <div key={n.nombre} className={`flex flex-col items-center gap-1 ${alcanzado ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${alcanzado ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    {n.emoji}
                  </div>
                  <p className="text-xs font-medium text-gray-600">{n.nombre}</p>
                  <p className="text-xs text-gray-400">{n.minXP} XP</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-purple-600">{estado.completadas.length}</p>
            <p className="text-sm text-gray-500">de {totalActividades} actividades</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-yellow-500">{estado.badges.length}</p>
            <p className="text-sm text-gray-500">badges ganados</p>
          </div>
        </div>

        {/* Progreso por ámbito */}
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <h4 className="font-bold text-gray-700 mb-4">Progreso por ámbito</h4>
          <div className="space-y-3">
            {AMBITOS.map(ambito => {
              const completadas = ambito.actividades.filter(a => estado.completadas.includes(a.id)).length
              const total = ambito.actividades.length
              const pct = Math.round((completadas / total) * 100)
              return (
                <div key={ambito.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      {ambito.emoji} {ambito.nombre}
                    </span>
                    <span className="text-xs text-gray-500">{completadas}/{total}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div className={`${ambito.bg} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <h4 className="font-bold text-gray-700 mb-3">Mis Badges</h4>
          {estado.badges.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Completa actividades para ganar badges 🏅</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {estado.badges.map((b, i) => (
                <span key={i} className="bg-purple-100 text-purple-700 px-3 py-2 rounded-xl text-sm font-medium">{b}</span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/ambitos')}
          className="w-full bg-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg"
        >
          Seguir completando actividades 🚀
        </button>
      </div>
    </div>
  )
}
