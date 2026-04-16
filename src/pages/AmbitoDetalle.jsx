import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { AMBITOS, getSemanaActual } from '../data/actividades'

const TIPO_ICON = { foto: '📷', quiz: '🧠', timer: '⏱️', texto: '✍️', swipe: '👆', streak: '🔥' }
const DIFICULTAD_COLOR = { Fácil: 'bg-green-100 text-green-700', Media: 'bg-yellow-100 text-yellow-700', Difícil: 'bg-red-100 text-red-700' }

export default function AmbitoDetalle() {
  const { ambitoId } = useParams()
  const navigate = useNavigate()
  const { estado } = useApp()
  const ambito = AMBITOS.find(a => a.id === ambitoId)
  const semanaActual = getSemanaActual()

  if (!ambito) return <div className="p-5">Ámbito no encontrado</div>

  const completadasAmbito = ambito.actividades.filter(a => estado.completadas.includes(a.id)).length
  const totalAmbito = ambito.actividades.length

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className={`${ambito.bg} text-white px-5 pt-10 pb-8`}>
        <button onClick={() => navigate('/ambitos')} className="text-white/80 text-sm mb-3">‹ Volver</button>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">{ambito.emoji}</span>
          <div>
            <h2 className="text-2xl font-bold">{ambito.nombre}</h2>
            <p className="text-white/80 text-sm">{ambito.descripcion}</p>
          </div>
        </div>
        {/* Progreso del ámbito */}
        <div className="bg-white/20 rounded-2xl p-3 backdrop-blur">
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>{completadasAmbito} de {totalAmbito} actividades completadas</span>
            <span>{Math.round((completadasAmbito / totalAmbito) * 100)}%</span>
          </div>
          <div className="bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${(completadasAmbito / totalAmbito) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-3">
        {ambito.actividades.map(act => {
          const completada = estado.completadas.includes(act.id)
          const bloqueada = act.semana > semanaActual
          const esSemanaActual = act.semana === semanaActual

          if (bloqueada) {
            // Tarjeta bloqueada
            return (
              <div key={act.id} className="bg-gray-100 rounded-3xl p-5 opacity-60">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                    🔒
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-400">{act.titulo}</h4>
                    <p className="text-gray-400 text-xs mt-1">Se desbloquea en la Semana {act.semana}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-gray-200 text-gray-400 px-2 py-1 rounded-full">+{act.xp} XP</span>
                      <span className="text-xs bg-gray-200 text-gray-400 px-2 py-1 rounded-full">⏱ {act.tiempo}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          // Tarjeta disponible o completada
          return (
            <button
              key={act.id}
              onClick={() => !completada && navigate(`/actividad/${ambito.id}/${act.id}`)}
              className={`w-full bg-white rounded-3xl shadow-sm p-5 text-left transition-all relative ${
                completada ? 'opacity-70 cursor-default' : 'hover:shadow-md active:scale-98'
              }`}
            >
              {/* Indicador semana actual */}
              {esSemanaActual && !completada && (
                <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full shadow">
                  ¡Esta semana!
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${completada ? 'bg-green-100' : `${ambito.bgLight}`}`}>
                  {completada ? '✅' : TIPO_ICON[act.tipo] || '📌'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-gray-800">{act.titulo}</h4>
                    {completada && <span className="text-green-600 text-xs font-bold">Completada ✓</span>}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{act.descripcion}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">+{act.xp} XP</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${DIFICULTAD_COLOR[act.dificultad]}`}>{act.dificultad}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">⏱ {act.tiempo}</span>
                    {act.badge && !completada && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{act.badge}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
