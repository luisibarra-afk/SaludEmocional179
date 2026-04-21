import { useState, useCallback, useEffect, useRef } from 'react'
import { useApp, getSubmissions, getCheckins, getAllAlumnos, getEstadoAlumnos, getSubmissionDetail } from '../context/AppContext'
import { AMBITOS, EMOCIONES, NIVELES } from '../data/actividades'

const TODAS_ACTIVIDADES = AMBITOS.flatMap(a =>
  (a.actividades || []).map(act => ({ ...act, ambitoId: a.id }))
)

function calcNivel(xp) {
  return [...NIVELES].reverse().find(n => xp >= n.minXP) || NIVELES[0]
}

function calcProgreso(xp) {
  const nivel = calcNivel(xp)
  const xpEnNivel = xp - nivel.minXP
  const xpNecesario = nivel.maxXP - nivel.minXP
  return Math.min((xpEnNivel / xpNecesario) * 100, 100)
}

function ModalAlumno({ alumno, onClose, submissions, checkins, estadoAlumnos }) {
  const estado = estadoAlumnos.find(e => e.no_control === alumno.no_control) || {}
  const completadas = estado.completadas || []
  const badges = estado.badges || []
  const xp = estado.xp || 0
  const racha = estado.racha || 0

  const nivel = calcNivel(xp)
  const progreso = calcProgreso(xp)

  const evidenciasAlumno = submissions.filter(s => s.alumno?.matricula === alumno.no_control)
  const ultimoCheckin = checkins.find(c => c.matricula === alumno.no_control)
  const [evidenciaAbierta, setEvidenciaAbierta] = useState(null)

  const pendientes = TODAS_ACTIVIDADES.filter(act => !completadas.includes(act.id))
  const completadasList = TODAS_ACTIVIDADES.filter(act => completadas.includes(act.id))

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end" onClick={onClose}>
      <div
        className="bg-gray-50 rounded-t-3xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header del alumno */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 mx-4 mt-2 mb-4 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              {ultimoCheckin?.emocion?.emoji || '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base leading-tight truncate">{alumno.nombre}</p>
              <p className="text-indigo-200 text-xs">
                {alumno.no_control}{alumno.grupo ? ` · Grupo ${alumno.grupo}` : ''}
              </p>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white text-xl flex-shrink-0">✕</button>
          </div>

          {/* Nivel / XP */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{nivel.emoji}</span>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">{nivel.nombre}</span>
                <span className="text-xs text-indigo-200">{xp} XP</span>
              </div>
              <div className="bg-white/20 rounded-full h-2">
                <div className="h-2 bg-white rounded-full transition-all" style={{ width: `${progreso}%` }} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-xl p-2 text-center">
              <p className="text-lg font-bold">{completadas.length}</p>
              <p className="text-xs text-indigo-200">completadas</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2 text-center">
              <p className="text-lg font-bold">{badges.length}</p>
              <p className="text-xs text-indigo-200">badges</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2 text-center">
              <p className="text-lg font-bold">{racha}🔥</p>
              <p className="text-xs text-indigo-200">racha días</p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-4 pb-8">
          {/* Badges / Logros */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h4 className="font-bold text-gray-700 text-sm mb-3">🏅 Logros desbloqueados</h4>
            {badges.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-2">Aún no ha ganado logros</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {badges.map((b, i) => (
                  <span key={i} className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium">
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Progreso por ámbito */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h4 className="font-bold text-gray-700 text-sm mb-3">📚 Progreso por ámbito</h4>
            <div className="space-y-3">
              {AMBITOS.map(ambito => {
                const actividadesAmbito = ambito.actividades || []
                const completadasEnAmbito = actividadesAmbito.filter(act => completadas.includes(act.id))
                const pct = actividadesAmbito.length > 0
                  ? (completadasEnAmbito.length / actividadesAmbito.length) * 100
                  : 0
                return (
                  <div key={ambito.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{ambito.emoji}</span>
                      <span className="text-xs font-medium text-gray-700 flex-1">{ambito.nombre}</span>
                      <span className="text-xs font-bold text-gray-500">
                        {completadasEnAmbito.length}/{actividadesAmbito.length}
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${ambito.bg || 'bg-indigo-500'} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actividades completadas */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h4 className="font-bold text-gray-700 text-sm mb-3">
              ✅ Completadas ({completadasList.length})
            </h4>
            {completadasList.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-2">Aún no ha completado actividades</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {completadasList.map(act => {
                  const ambito = AMBITOS.find(a => a.id === act.ambitoId)
                  return (
                    <div key={act.id} className="flex items-center gap-2 py-2">
                      <span className="text-base flex-shrink-0">{ambito?.emoji}</span>
                      <span className="text-sm text-gray-700 flex-1">{act.titulo}</span>
                      <span className="text-xs font-semibold text-green-600 flex-shrink-0">+{act.xp} XP</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actividades pendientes */}
          {pendientes.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h4 className="font-bold text-gray-700 text-sm mb-3">
                ⏳ Pendientes ({pendientes.length})
              </h4>
              <div className="divide-y divide-gray-50">
                {pendientes.slice(0, 10).map(act => {
                  const ambito = AMBITOS.find(a => a.id === act.ambitoId)
                  return (
                    <div key={act.id} className="flex items-center gap-2 py-2 opacity-60">
                      <span className="text-base flex-shrink-0">{ambito?.emoji}</span>
                      <span className="text-sm text-gray-500 flex-1">{act.titulo}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">Sem {act.semana}</span>
                    </div>
                  )
                })}
                {pendientes.length > 10 && (
                  <p className="text-xs text-gray-400 text-center pt-2">
                    +{pendientes.length - 10} más pendientes
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Evidencias */}
          {evidenciasAlumno.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h4 className="font-bold text-gray-700 text-sm mb-3">
                📎 Evidencias ({evidenciasAlumno.length})
              </h4>
              <div className="space-y-2">
                {evidenciasAlumno.map((sub, i) => {
                  const ambito = AMBITOS.find(a => a.id === sub.ambitoId)
                  const abierta = evidenciaAbierta === i
                  return (
                    <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setEvidenciaAbierta(abierta ? null : i)}
                        className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 transition-all"
                      >
                        <div className={`w-8 h-8 ${ambito?.bg || 'bg-gray-400'} rounded-lg flex items-center justify-center text-sm flex-shrink-0`}>
                          {ambito?.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{sub.titulo}</p>
                          <p className="text-xs text-gray-400">{sub.fecha}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          sub.tipo === 'foto' ? 'bg-blue-100 text-blue-700' :
                          sub.tipo === 'texto' ? 'bg-green-100 text-green-700' :
                          sub.tipo === 'quiz' ? 'bg-purple-100 text-purple-700' :
                          sub.tipo === 'timer' ? 'bg-orange-100 text-orange-700' :
                          sub.tipo === 'juego' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {sub.tipo === 'foto' ? '📷' : sub.tipo === 'texto' ? '✍️' :
                           sub.tipo === 'quiz' ? '🧠' : sub.tipo === 'timer' ? '⏱️' :
                           sub.tipo === 'juego' ? '🎮' : '✅'}
                        </span>
                        <span className="text-gray-400 text-xs">{abierta ? '▲' : '▼'}</span>
                      </button>
                      {abierta && (
                        <div className="px-3 pb-3 pt-2 border-t border-gray-100 space-y-2">
                          {sub.tipo === 'foto' && (sub.fotoUrl || sub.fotoBase64) && (
                            <img src={sub.fotoUrl || sub.fotoBase64} alt="evidencia" className="w-full rounded-xl object-cover max-h-48" />
                          )}
                          {sub.tipo === 'foto' && sub.comentario && (
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">{sub.comentario}</p>
                          )}
                          {sub.tipo === 'texto' && sub.texto && (
                            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2 whitespace-pre-wrap">{sub.texto}</p>
                          )}
                          {sub.tipo === 'quiz' && sub.respuesta && (
                            <p className="text-sm text-purple-700 bg-purple-50 rounded-lg p-2">
                              <strong>Respondió:</strong> {sub.respuesta}
                            </p>
                          )}
                          {sub.tipo === 'honor' && sub.habito && (
                            <p className="text-sm text-green-700 bg-green-50 rounded-lg p-2">
                              <strong>Hábito elegido:</strong> {sub.habito}
                            </p>
                          )}
                          {sub.tipo === 'swipe' && (
                            <p className="text-sm text-orange-700 bg-orange-50 rounded-lg p-2">
                              <strong>Aciertos:</strong> {sub.aciertos} de {sub.total}
                            </p>
                          )}
                          {sub.tipo === 'juego' && sub.resultado && (
                            <div className="text-sm text-indigo-700 bg-indigo-50 rounded-lg p-2 space-y-0.5">
                              {sub.resultado.correctas !== undefined && <p>⭐ {sub.resultado.correctas}/{sub.resultado.total} correctas</p>}
                              {sub.resultado.movimientos !== undefined && <p>🧩 {sub.resultado.movimientos} movimientos · {sub.resultado.pares} pares</p>}
                              {sub.resultado.ganadas !== undefined && <p>🔤 {sub.resultado.ganadas}/{sub.resultado.total} palabras</p>}
                              {sub.resultado.encontradas !== undefined && <p>🔍 {sub.resultado.encontradas}/{sub.resultado.total} palabras</p>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Docente() {
  const { estado, logout } = useApp()
  const [tab, setTab] = useState('emocional')
  const [filtroAmbito, setFiltroAmbito] = useState('todos')
  const [submisionAbierta, setSubmisionAbierta] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [checkins, setCheckins] = useState([])
  const [todosAlumnos, setTodosAlumnos] = useState([])
  const [estadoAlumnos, setEstadoAlumnos] = useState([])
  const [fetchando, setFetchando] = useState(true)
  const [fetchandoAlumnos, setFetchandoAlumnos] = useState(false)
  const [alumnoModal, setAlumnoModal] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const detailCache = useRef({}) // id -> evidencia completa

  const refrescar = useCallback(async () => {
    setFetchando(true)
    setSubmisionAbierta(null)
    // Fase 1: datos críticos (Evidencias + Emocional) — se muestran de inmediato
    const [subs, chks] = await Promise.all([getSubmissions(), getCheckins()])
    setSubmissions(subs)
    setCheckins(chks)
    setFetchando(false)
    // Fase 2: datos del tab Alumnos — carga en segundo plano sin bloquear la UI
    setFetchandoAlumnos(true)
    const [alumnos, estados] = await Promise.all([getAllAlumnos(), getEstadoAlumnos()])
    setTodosAlumnos(alumnos)
    setEstadoAlumnos(estados)
    setFetchandoAlumnos(false)
  }, [])

  useEffect(() => { refrescar() }, [])

  const filtradas = filtroAmbito === 'todos'
    ? submissions
    : submissions.filter(s => s.ambitoId === filtroAmbito)

  const alumnosUnicos = [...new Map(submissions.map(s => [s.alumno?.matricula, s.alumno])).values()].filter(Boolean)

  // — Datos emocionales —
  const HOY = new Date().toDateString()
  const checkinsHoy = checkins.filter(c => c.fecha === HOY)
  const alumnosCheckinHoy = [...new Map(checkinsHoy.map(c => [c.matricula, c])).values()]

  const conteoEmociones = EMOCIONES.map(em => ({
    ...em,
    count: checkinsHoy.filter(c => c.emocion?.label === em.label).length,
  }))
  const maxCount = Math.max(...conteoEmociones.map(e => e.count), 1)

  const alumnosConCheckin = [...new Map(checkins.map(c => [c.matricula, { matricula: c.matricula, nombre: c.nombre }])).values()]

  const [alumnoExpandido, setAlumnoExpandido] = useState(null)

  // Lista de alumnos para el tab — preferir todosAlumnos, fallback a los de evidencias
  const listaAlumnos = todosAlumnos.length > 0
    ? todosAlumnos
    : alumnosUnicos.map(a => ({ no_control: a.matricula, nombre: a.nombre, grupo: '' }))

  const alumnosActivos = listaAlumnos.filter(a =>
    estadoAlumnos.find(e => e.no_control === a.no_control && (e.completadas?.length > 0 || e.xp > 0))
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Modal del alumno */}
      {alumnoModal && (
        <ModalAlumno
          alumno={alumnoModal}
          onClose={() => setAlumnoModal(null)}
          submissions={submissions}
          checkins={checkins}
          estadoAlumnos={estadoAlumnos}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 to-purple-700 text-white px-5 pt-10 pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-indigo-200 text-sm">Panel Docente</p>
            <h2 className="text-xl font-bold">Bienvenido/a, {estado.usuario?.nombre} 👩‍🏫</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={refrescar} disabled={fetchando} className="text-indigo-200 text-xs border border-indigo-400 rounded-full px-3 py-1 disabled:opacity-50">
              {fetchando ? '⏳' : '🔄'} Actualizar
            </button>
            <button onClick={logout} className="text-indigo-200 text-xs border border-indigo-400 rounded-full px-3 py-1">
              Salir
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/20 rounded-xl p-1">
          <button onClick={() => setTab('emocional')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === 'emocional' ? 'bg-white text-indigo-700' : 'text-white/80'}`}>
            ❤️ Emocional
          </button>
          <button onClick={() => setTab('evidencias')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === 'evidencias' ? 'bg-white text-indigo-700' : 'text-white/80'}`}>
            📋 Evidencias
          </button>
          <button onClick={() => setTab('alumnos')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === 'alumnos' ? 'bg-white text-indigo-700' : 'text-white/80'}`}>
            👥 Alumnos
          </button>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-4">

        {/* TAB: EMOCIONAL */}
        {tab === 'emocional' && (
          <>
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">📊 Clima emocional hoy</h3>
                  <p className="text-xs text-gray-400">{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">{alumnosCheckinHoy.length}</p>
                  <p className="text-xs text-gray-400">registros hoy</p>
                </div>
              </div>

              {checkinsHoy.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-4xl">😴</span>
                  <p className="text-gray-400 text-sm mt-2">Ningún alumno ha registrado su emoción hoy</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conteoEmociones.filter(e => e.count > 0).map(em => (
                    <div key={em.label} className="flex items-center gap-3">
                      <span className="text-2xl w-8 text-center">{em.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-sm text-gray-700 font-medium">{em.label}</span>
                          <span className="text-sm font-bold text-gray-500">{em.count}</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${em.color} transition-all duration-500`}
                            style={{ width: `${(em.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {alumnosCheckinHoy.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <h4 className="font-bold text-gray-700 text-sm mb-3">✅ Registraron hoy</h4>
                <div className="flex flex-wrap gap-2">
                  {alumnosCheckinHoy.map(c => (
                    <div key={c.matricula} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5">
                      <span className="text-lg">{c.emocion?.emoji}</span>
                      <span className="text-xs text-gray-700 font-medium">{c.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h4 className="font-bold text-gray-700 text-sm mb-3">📅 Historial por alumno</h4>
              {alumnosConCheckin.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Sin registros aún</p>
              ) : (
                <div className="space-y-2">
                  {alumnosConCheckin.map(alumno => {
                    const historial = checkins
                      .filter(c => c.matricula === alumno.matricula)
                      .slice(0, 14)
                    const abierto = alumnoExpandido === alumno.matricula
                    return (
                      <div key={alumno.matricula} className="border border-gray-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setAlumnoExpandido(abierto ? null : alumno.matricula)}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-all"
                        >
                          <div className="text-xl">{historial[0]?.emocion?.emoji || '❓'}</div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{alumno.nombre}</p>
                            <p className="text-xs text-gray-400">{historial.length} registros</p>
                          </div>
                          <div className="flex gap-0.5">
                            {historial.slice(0, 7).map((c, i) => (
                              <span key={i} className="text-sm">{c.emocion?.emoji}</span>
                            ))}
                          </div>
                          <span className="text-gray-400 text-sm">{abierto ? '▲' : '▼'}</span>
                        </button>
                        {abierto && (
                          <div className="px-3 pb-3 space-y-1.5 border-t border-gray-100 pt-2">
                            {historial.map((c, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="text-lg">{c.emocion?.emoji}</span>
                                <span className="font-medium text-gray-700">{c.emocion?.label}</span>
                                <span className="text-gray-400 text-xs ml-auto">{c.fechaHora}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB: EVIDENCIAS */}
        {tab === 'evidencias' && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFiltroAmbito('todos')}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium border transition-all ${filtroAmbito === 'todos' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                Todos ({submissions.length})
              </button>
              {AMBITOS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setFiltroAmbito(a.id)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium border transition-all ${filtroAmbito === a.id ? `${a.bg} text-white border-transparent` : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  {a.emoji} {a.nombre.split(' ')[0]}
                </button>
              ))}
            </div>

            {filtradas.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
                <span className="text-5xl">📭</span>
                <p className="text-gray-500 mt-3 font-medium">Aún no hay evidencias</p>
                <p className="text-gray-400 text-sm">Cuando los alumnos completen actividades, aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtradas.map((sub, i) => {
                  const ambito = AMBITOS.find(a => a.id === sub.ambitoId)
                  const isOpen = submisionAbierta === i
                  const detail = detailCache.current[sub.id]
                  const isLoadingThis = loadingDetail && isOpen && !detail

                  const handleOpen = async () => {
                    if (isOpen) { setSubmisionAbierta(null); return }
                    setSubmisionAbierta(i)
                    if (!detailCache.current[sub.id]) {
                      setLoadingDetail(true)
                      const d = await getSubmissionDetail(sub.id)
                      detailCache.current[sub.id] = d
                      setLoadingDetail(false)
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={handleOpen}
                      className="w-full bg-white rounded-2xl shadow-sm text-left overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${ambito?.bg || 'bg-gray-400'} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                            {sub.ambitoEmoji || ambito?.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm">{sub.titulo}</p>
                            <p className="text-gray-500 text-xs">{sub.alumno?.nombre} · {sub.fecha}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                            sub.tipo === 'foto' ? 'bg-blue-100 text-blue-700' :
                            sub.tipo === 'texto' ? 'bg-green-100 text-green-700' :
                            sub.tipo === 'quiz' ? 'bg-purple-100 text-purple-700' :
                            sub.tipo === 'timer' ? 'bg-orange-100 text-orange-700' :
                            sub.tipo === 'juego' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {sub.tipo === 'foto' ? '📷 Foto' :
                             sub.tipo === 'texto' ? '✍️ Texto' :
                             sub.tipo === 'quiz' ? '🧠 Quiz' :
                             sub.tipo === 'timer' ? '⏱️ Timer' :
                             sub.tipo === 'honor' ? '✅ Honor' :
                             sub.tipo === 'swipe' ? '👆 Swipe' :
                             sub.tipo === 'juego' ? `${sub.icono || '🎮'} Juego` : sub.tipo}
                          </span>
                        </div>

                        {isOpen && (
                          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                            {isLoadingThis ? (
                              <div className="flex items-center gap-2 py-2">
                                <span className="animate-spin text-lg">⏳</span>
                                <p className="text-gray-400 text-sm">Cargando evidencia...</p>
                              </div>
                            ) : detail ? (
                              <>
                                {detail.tipo === 'foto' && (detail.fotoUrl || detail.fotoBase64) && (
                                  <div className="space-y-2">
                                    <img src={detail.fotoUrl || detail.fotoBase64} alt="evidencia" className="w-full rounded-xl object-cover max-h-64" />
                                    {detail.comentario && (
                                      <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap">
                                        <span className="font-medium text-gray-500 text-xs block mb-1">💬 Comentario:</span>
                                        {detail.comentario}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {detail.tipo === 'texto' && detail.texto && (
                                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap">{detail.texto}</div>
                                )}
                                {detail.tipo === 'quiz' && detail.respuesta && (
                                  <div className="bg-purple-50 rounded-xl p-3 text-sm text-purple-700">
                                    <span className="font-medium">Respondió:</span> {detail.respuesta}
                                  </div>
                                )}
                                {detail.tipo === 'honor' && detail.habito && (
                                  <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700">
                                    <span className="font-medium">Hábito elegido:</span> {detail.habito}
                                  </div>
                                )}
                                {detail.tipo === 'swipe' && (
                                  <div className="bg-orange-50 rounded-xl p-3 text-sm text-orange-700">
                                    <span className="font-medium">Aciertos:</span> {detail.aciertos} de {detail.total}
                                  </div>
                                )}
                                {detail.tipo === 'timer' && (
                                  <div className="bg-orange-50 rounded-xl p-3 text-sm text-orange-700">
                                    ✅ Completó el reto cronometrado
                                  </div>
                                )}
                                {detail.tipo === 'juego' && (
                                  <div className="bg-indigo-50 rounded-xl p-3 text-sm text-indigo-700 space-y-1">
                                    <p className="font-medium">{detail.icono} {detail.subtipo === 'memorama' ? 'Memorama' : detail.subtipo === 'trivia_veloz' ? 'Trivia Veloz' : detail.subtipo === 'ahorcado' ? 'Ahorcado' : detail.subtipo === 'sopa' ? 'Sopa de Letras' : detail.subtipo}</p>
                                    {detail.resultado && (
                                      <p>
                                        {detail.resultado.correctas !== undefined && `⭐ ${detail.resultado.correctas}/${detail.resultado.total} correctas`}
                                        {detail.resultado.movimientos !== undefined && `🧩 ${detail.resultado.movimientos} movimientos`}
                                        {detail.resultado.encontradas !== undefined && `🔍 ${detail.resultado.encontradas}/${detail.resultado.total} palabras`}
                                      </p>
                                    )}
                                  </div>
                                )}
                                <p className="text-xs text-gray-400">Matrícula: {sub.alumno?.matricula}</p>
                              </>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* TAB: ALUMNOS */}
        {tab === 'alumnos' && (
          <>
            {fetchandoAlumnos && (
              <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <span className="text-xl animate-spin">⏳</span>
                <p className="text-sm text-gray-500">Cargando lista de alumnos...</p>
              </div>
            )}
            {/* Resumen del grupo */}
            {listaAlumnos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
                  <p className="text-2xl font-bold text-indigo-600">{listaAlumnos.length}</p>
                  <p className="text-xs text-gray-400 mt-0.5">registrados</p>
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
                  <p className="text-2xl font-bold text-green-600">{alumnosActivos.length}</p>
                  <p className="text-xs text-gray-400 mt-0.5">activos</p>
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
                  <p className="text-2xl font-bold text-purple-600">{submissions.length}</p>
                  <p className="text-xs text-gray-400 mt-0.5">evidencias</p>
                </div>
              </div>
            )}

            {listaAlumnos.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
                <span className="text-5xl">👥</span>
                <p className="text-gray-500 mt-3 font-medium">Aún no hay alumnos registrados</p>
                <p className="text-gray-400 text-sm">Aparecerán aquí cuando completen actividades.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {listaAlumnos.map((alumno, i) => {
                  const est = estadoAlumnos.find(e => e.no_control === alumno.no_control)
                  const completadas = est?.completadas || []
                  const badges = est?.badges || []
                  const xp = est?.xp || 0
                  const nivel = calcNivel(xp)
                  const ultimoCheckin = checkins.find(c => c.matricula === alumno.no_control)
                  const activo = completadas.length > 0 || xp > 0

                  return (
                    <button
                      key={i}
                      onClick={() => setAlumnoModal(alumno)}
                      className="w-full bg-white rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                          {ultimoCheckin?.emocion?.emoji || (activo ? nivel.emoji : '👤')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{alumno.nombre}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {activo ? (
                              <>
                                <span className="text-xs text-indigo-600 font-medium">{nivel.emoji} {nivel.nombre}</span>
                                <span className="text-xs text-gray-400">·</span>
                                <span className="text-xs text-gray-500">{xp} XP</span>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">Sin actividad aún</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-gray-700">{completadas.length}</span>
                            <span className="text-xs text-gray-400">✅</span>
                          </div>
                          {badges.length > 0 && (
                            <span className="text-xs text-amber-600 font-medium">{badges.length} 🏅</span>
                          )}
                        </div>
                        <span className="text-gray-300 text-sm ml-1">›</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
