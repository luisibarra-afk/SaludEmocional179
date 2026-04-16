import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { AMBITOS, getSemanaActual } from '../data/actividades'

export default function Ambitos() {
  const navigate = useNavigate()
  const { estado } = useApp()
  const semanaActual = getSemanaActual()

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white px-5 pt-10 pb-8">
        <h2 className="text-2xl font-bold">Tu Mochila 🎒</h2>
        <p className="text-purple-200 text-sm mt-1">Semana {semanaActual} · 1 actividad por ámbito desbloqueada</p>
      </div>

      <div className="px-5 mt-5 space-y-4">
        {AMBITOS.map(ambito => {
          const desbloqueadas = ambito.actividades.filter(a => a.semana <= semanaActual)
          const completadas   = ambito.actividades.filter(a => a.semana <= semanaActual && estado.completadas.includes(a.id))
          const pendienteSemana = ambito.actividades.find(a => a.semana === semanaActual && !estado.completadas.includes(a.id))
          const porcentaje = desbloqueadas.length > 0 ? Math.round((completadas.length / desbloqueadas.length) * 100) : 0

          return (
            <button
              key={ambito.id}
              onClick={() => navigate(`/ambito/${ambito.id}`)}
              className="w-full bg-white rounded-3xl shadow-sm overflow-hidden text-left hover:shadow-md active:scale-98 transition-all"
            >
              <div className={`${ambito.bg} px-5 py-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{ambito.emoji}</span>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{ambito.nombre}</h3>
                      <p className="text-white/80 text-xs">{ambito.descripcion}</p>
                    </div>
                  </div>
                  <span className="text-white/60 text-2xl">›</span>
                </div>
              </div>

              <div className="px-5 py-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-500">{completadas.length}/{desbloqueadas.length} desbloqueadas completadas</span>
                  <span className="text-xs font-bold text-gray-700">{porcentaje}%</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2 mb-2">
                  <div className={`${ambito.bg} h-2 rounded-full transition-all`} style={{ width: `${porcentaje}%` }} />
                </div>

                {/* Indicador actividad pendiente esta semana */}
                {pendienteSemana && (
                  <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-1.5">
                    <span className="text-yellow-500 text-xs">⚡</span>
                    <span className="text-yellow-700 text-xs font-medium">Pendiente: {pendienteSemana.titulo}</span>
                  </div>
                )}
                {!pendienteSemana && desbloqueadas.length > 0 && completadas.length === desbloqueadas.length && (
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
                    <span className="text-green-500 text-xs">✅</span>
                    <span className="text-green-700 text-xs font-medium">¡Al día esta semana!</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
