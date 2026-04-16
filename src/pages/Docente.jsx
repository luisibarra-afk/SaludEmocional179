import { useState, useCallback } from 'react'
import { useApp, getSubmissions, getCheckins } from '../context/AppContext'
import { AMBITOS, EMOCIONES } from '../data/actividades'

export default function Docente() {
  const { estado, logout } = useApp()
  const [tab, setTab] = useState('emocional') // emocional | evidencias | alumnos
  const [filtroAmbito, setFiltroAmbito] = useState('todos')
  const [submisionAbierta, setSubmisionAbierta] = useState(null)
  const [submissions, setSubmissions] = useState(() => getSubmissions())
  const [checkins, setCheckins] = useState(() => getCheckins())

  const refrescar = useCallback(() => {
    setSubmissions(getSubmissions())
    setCheckins(getCheckins())
    setSubmisionAbierta(null)
  }, [])

  const filtradas = filtroAmbito === 'todos'
    ? submissions
    : submissions.filter(s => s.ambitoId === filtroAmbito)

  const alumnosUnicos = [...new Map(submissions.map(s => [s.alumno?.matricula, s.alumno])).values()].filter(Boolean)

  // — Datos emocionales —
  const HOY = new Date().toDateString()
  const checkinsHoy = checkins.filter(c => c.fecha === HOY)
  const alumnosCheckinHoy = [...new Map(checkinsHoy.map(c => [c.matricula, c])).values()]

  // Conteo por emoción (hoy)
  const conteoEmociones = EMOCIONES.map(em => ({
    ...em,
    count: checkinsHoy.filter(c => c.emocion?.label === em.label).length,
  }))
  const maxCount = Math.max(...conteoEmociones.map(e => e.count), 1)

  // Alumnos únicos que alguna vez hicieron checkin
  const alumnosConCheckin = [...new Map(checkins.map(c => [c.matricula, { matricula: c.matricula, nombre: c.nombre }])).values()]

  // Historial por alumno (últimos 7 días)
  const [alumnoExpandido, setAlumnoExpandido] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 to-purple-700 text-white px-5 pt-10 pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-indigo-200 text-sm">Panel Docente</p>
            <h2 className="text-xl font-bold">Bienvenido/a, {estado.usuario?.nombre} 👩‍🏫</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={refrescar} className="text-indigo-200 text-xs border border-indigo-400 rounded-full px-3 py-1">
              🔄 Actualizar
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
            {/* Resumen hoy */}
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

            {/* Quién registró hoy */}
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

            {/* Historial por alumno */}
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
                          {/* Últimas 7 emociones como burbujas */}
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
                  return (
                    <button
                      key={i}
                      onClick={() => setSubmisionAbierta(submisionAbierta === i ? null : i)}
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

                        {submisionAbierta === i && (
                          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                            {sub.tipo === 'foto' && sub.fotoBase64 && (
                              <div className="space-y-2">
                                <img src={sub.fotoBase64} alt="evidencia" className="w-full rounded-xl object-cover max-h-64" />
                                {sub.comentario && (
                                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap">
                                    <span className="font-medium text-gray-500 text-xs block mb-1">💬 Comentario:</span>
                                    {sub.comentario}
                                  </div>
                                )}
                              </div>
                            )}
                            {sub.tipo === 'texto' && sub.texto && (
                              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap">{sub.texto}</div>
                            )}
                            {sub.tipo === 'quiz' && sub.respuesta && (
                              <div className="bg-purple-50 rounded-xl p-3 text-sm text-purple-700">
                                <span className="font-medium">Respondió:</span> {sub.respuesta}
                              </div>
                            )}
                            {sub.tipo === 'honor' && sub.habito && (
                              <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700">
                                <span className="font-medium">Hábito elegido:</span> {sub.habito}
                              </div>
                            )}
                            {sub.tipo === 'swipe' && (
                              <div className="bg-orange-50 rounded-xl p-3 text-sm text-orange-700">
                                <span className="font-medium">Aciertos:</span> {sub.aciertos} de {sub.total}
                              </div>
                            )}
                            {sub.tipo === 'timer' && (
                              <div className="bg-orange-50 rounded-xl p-3 text-sm text-orange-700">
                                ✅ Completó el reto cronometrado
                              </div>
                            )}
                            {sub.tipo === 'juego' && (
                              <div className="bg-indigo-50 rounded-xl p-3 text-sm text-indigo-700 space-y-1">
                                <p className="font-medium">{sub.icono} {sub.subtipo === 'memorama' ? 'Memorama' : sub.subtipo === 'trivia_veloz' ? 'Trivia Veloz' : sub.subtipo === 'ahorcado' ? 'Ahorcado' : sub.subtipo === 'sopa' ? 'Sopa de Letras' : sub.subtipo}</p>
                                {sub.resultado && (
                                  <p>
                                    {sub.resultado.correctas !== undefined && `⭐ ${sub.resultado.correctas}/${sub.resultado.total} correctas`}
                                    {sub.resultado.movimientos !== undefined && `🧩 ${sub.resultado.movimientos} movimientos · ${sub.resultado.pares} pares`}
                                    {sub.resultado.ganadas !== undefined && `🔤 ${sub.resultado.ganadas}/${sub.resultado.total} palabras`}
                                    {sub.resultado.encontradas !== undefined && `🔍 ${sub.resultado.encontradas}/${sub.resultado.total} palabras`}
                                  </p>
                                )}
                              </div>
                            )}
                            <p className="text-xs text-gray-400">Matrícula: {sub.alumno?.matricula}</p>
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
            {alumnosUnicos.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
                <span className="text-5xl">👥</span>
                <p className="text-gray-500 mt-3 font-medium">Aún no hay alumnos registrados</p>
                <p className="text-gray-400 text-sm">Aparecerán aquí cuando completen actividades.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alumnosUnicos.map((alumno, i) => {
                  const actividadesAlumno = submissions.filter(s => s.alumno?.matricula === alumno.matricula)
                  const ambitos = [...new Set(actividadesAlumno.map(s => s.ambitoId))]
                  const ultimoCheckin = checkins.find(c => c.matricula === alumno.matricula)
                  return (
                    <div key={i} className="bg-white rounded-2xl shadow-sm p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl">
                          {ultimoCheckin?.emocion?.emoji || '👤'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{alumno.nombre}</p>
                          <p className="text-xs text-gray-400">Matrícula: {alumno.matricula}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="font-bold text-indigo-600">{actividadesAlumno.length}</p>
                          <p className="text-xs text-gray-400">actividades</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {ambitos.map(aid => {
                          const amb = AMBITOS.find(a => a.id === aid)
                          return amb ? (
                            <span key={aid} className={`${amb.bg} text-white text-xs px-2 py-1 rounded-full`}>
                              {amb.emoji} {amb.nombre.split(' ')[0]}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
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
