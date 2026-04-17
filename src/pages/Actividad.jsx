import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { AMBITOS } from '../data/actividades'
import Memorama from '../components/juegos/Memorama'
import TriviaVeloz from '../components/juegos/TriviaVeloz'
import Ahorcado from '../components/juegos/Ahorcado'
import SopaLetras from '../components/juegos/SopaLetras'

export default function Actividad() {
  const { ambitoId, actividadId } = useParams()
  const navigate = useNavigate()
  const { completarActividad, estado } = useApp()
  const ambito = AMBITOS.find(a => a.id === ambitoId)
  const actividad = ambito?.actividades.find(a => a.id === actividadId)
  const [fase, setFase] = useState('intro') // intro | haciendo | done
  const [respuesta, setRespuesta] = useState('')
  const [fotoUrl, setFotoUrl] = useState(null)   // preview base64
  const [fotoFile, setFotoFile] = useState(null)  // archivo original para subir
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null)
  const [timerActivo, setTimerActivo] = useState(false)
  const [segundosRestantes, setSegundosRestantes] = useState(0)
  const [swipeIndex, setSwipeIndex] = useState(0)
  const [swipeRespuestas, setSwipeRespuestas] = useState([])
  const [swipeRespuestaActual, setSwipeRespuestaActual] = useState(null) // null | true | false
  const [habitoSeleccionado, setHabitoSeleccionado] = useState(null)
  const [pasoTimer, setPasoTimer] = useState(0)
  const intervalRef = useRef(null)
  const fileRef = useRef(null)

  const yaCompletada = estado.completadas.includes(actividadId)

  useEffect(() => {
    if (timerActivo && segundosRestantes > 0) {
      intervalRef.current = setInterval(() => {
        setSegundosRestantes(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setTimerActivo(false)
            handleCompletar()
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [timerActivo])

  if (!ambito || !actividad) return <div className="p-5">Actividad no encontrada</div>

  const iniciarTimer = (segundos) => {
    setSegundosRestantes(segundos)
    setTimerActivo(true)
  }

  const handleFoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setFotoUrl(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleCompletar = async (resultadoJuego = null) => {
    let evidencia = null
    const base = { titulo: actividad.titulo, ambitoNombre: ambito.nombre, ambitoEmoji: ambito.emoji }

    if (actividad.verificacion === 'foto' && fotoUrl) {
      let fotoFinal = fotoUrl // fallback a base64
      if (fotoFile && estado.usuario?.no_control) {
        setSubiendoFoto(true)
        const ext = fotoFile.name.split('.').pop() || 'jpg'
        const path = `${estado.usuario.no_control}/${actividadId}_${Date.now()}.${ext}`
        const { data: up, error } = await supabase.storage.from('evidencias').upload(path, fotoFile, { contentType: fotoFile.type })
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('evidencias').getPublicUrl(up.path)
          fotoFinal = publicUrl
        }
        setSubiendoFoto(false)
      }
      evidencia = { ...base, tipo: 'foto', fotoUrl: fotoFinal, comentario: respuesta || null }
    } else if (actividad.verificacion === 'texto' && respuesta) {
      evidencia = { ...base, tipo: 'texto', texto: respuesta }
    } else if (actividad.verificacion === 'quiz' && opcionSeleccionada !== null) {
      evidencia = { ...base, tipo: 'quiz', respuesta: actividad.opciones?.[opcionSeleccionada] }
    } else if (actividad.verificacion === 'timer') {
      evidencia = { ...base, tipo: 'timer' }
    } else if (actividad.verificacion === 'honor' && habitoSeleccionado !== null) {
      evidencia = { ...base, tipo: 'honor', habito: actividad.opciones_habito?.[habitoSeleccionado] }
    } else if (actividad.verificacion === 'swipe') {
      const aciertos = swipeRespuestas.filter((r, i) => r === actividad.tarjetas?.[i]?.esRealidad).length
      evidencia = { ...base, tipo: 'swipe', aciertos, total: actividad.tarjetas?.length }
    } else if (actividad.verificacion === 'juego') {
      // Juegos: memorama, trivia, ahorcado, sopa
      const iconos = { memorama: '🧩', trivia_veloz: '⚡', ahorcado: '🔤', sopa: '🔍' }
      evidencia = { ...base, tipo: 'juego', subtipo: actividad.tipo, icono: iconos[actividad.tipo] || '🎮', resultado: resultadoJuego }
    }
    completarActividad(actividadId, ambitoId, actividad.xp, actividad.badge, evidencia)
    setFase('done')
  }

  const puedeCompletar = () => {
    if (actividad.verificacion === 'foto') return !!fotoUrl
    if (actividad.verificacion === 'quiz') return opcionSeleccionada !== null
    if (actividad.verificacion === 'texto') return respuesta.length >= 20
    if (actividad.verificacion === 'honor') return habitoSeleccionado !== null
    if (actividad.verificacion === 'swipe') return swipeIndex >= (actividad.tarjetas?.length || 0)
    return true
  }

  // ——— FASE: INTRO ———
  if (fase === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className={`${ambito.bg} text-white px-5 pt-10 pb-10`}>
          <button onClick={() => navigate(-1)} className="text-white/80 text-sm mb-4">‹ Volver</button>
          <div className="text-4xl mb-2">{actividad.tipo === 'foto' ? '📷' : actividad.tipo === 'quiz' ? '🧠' : actividad.tipo === 'timer' ? '⏱️' : actividad.tipo === 'swipe' ? '👆' : '✍️'}</div>
          <h2 className="text-2xl font-bold">{actividad.titulo}</h2>
          <p className="text-white/80 text-sm mt-2">{actividad.descripcion}</p>
        </div>

        <div className="px-5 mt-5 space-y-4">
          {/* Info chips */}
          <div className="flex gap-2 flex-wrap">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">+{actividad.xp} XP</span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">⏱ {actividad.tiempo}</span>
            {actividad.badge && <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">{actividad.badge}</span>}
          </div>

          {/* Instrucciones */}
          {actividad.instrucciones && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h4 className="font-bold text-gray-700 mb-3">¿Cómo hacerlo?</h4>
              <ol className="space-y-2">
                {actividad.instrucciones.map((inst, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    {inst}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {actividad.pasos && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h4 className="font-bold text-gray-700 mb-3">Pasos</h4>
              <div className="space-y-2">
                {actividad.pasos.map((p, i) => (
                  <div key={i} className="flex gap-3 items-center text-sm text-gray-600">
                    <span className="text-lg">{['🫁', '🤐', '😮‍💨'][i]}</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {yaCompletada ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <span className="text-3xl">✅</span>
              <p className="text-green-700 font-bold mt-2">¡Ya completaste esta actividad!</p>
              <button onClick={() => navigate(-1)} className="mt-3 text-green-600 underline text-sm">Volver</button>
            </div>
          ) : (
            <button
              onClick={() => setFase('haciendo')}
              className={`w-full ${ambito.bg} text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all text-lg`}
            >
              ¡Comenzar! 🚀
            </button>
          )}
        </div>
      </div>
    )
  }

  // ——— FASE: HACIENDO ———
  if (fase === 'haciendo') {
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className={`${ambito.bg} text-white px-5 pt-10 pb-6`}>
          <h2 className="text-xl font-bold">{actividad.titulo}</h2>
        </div>

        <div className="px-5 mt-5 space-y-4">

          {/* FOTO */}
          {actividad.verificacion === 'foto' && (
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <p className="text-gray-700 font-medium">Sube una foto como evidencia:</p>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFoto} />
              {fotoUrl ? (
                <div className="space-y-3">
                  <img src={fotoUrl} alt="evidencia" className="w-full rounded-xl object-cover max-h-60" />
                  <button onClick={() => { setFotoUrl(null); fileRef.current?.click() }} className="text-sm text-purple-600 underline">Cambiar foto</button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-xl py-10 flex flex-col items-center gap-2 text-gray-400 hover:border-purple-400 hover:text-purple-400 transition-all">
                  <span className="text-4xl">📷</span>
                  <span className="text-sm">Toca para tomar o seleccionar foto</span>
                </button>
              )}
              <div>
                <label className="text-sm text-gray-600 font-medium block mb-1">Comentario o descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
                <textarea
                  rows={3}
                  value={respuesta}
                  onChange={e => setRespuesta(e.target.value)}
                  placeholder="Describe brevemente lo que hiciste, cómo te sentiste..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
            </div>
          )}

          {/* QUIZ */}
          {actividad.verificacion === 'quiz' && (
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <p className="text-gray-800 font-semibold">{actividad.pregunta}</p>
              <div className="space-y-2">
                {actividad.opciones?.map((op, i) => (
                  <button
                    key={i}
                    onClick={() => setOpcionSeleccionada(i)}
                    className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${opcionSeleccionada === i ? `border-purple-500 bg-purple-50 text-purple-700 font-medium` : 'border-gray-100 text-gray-600'}`}
                  >
                    {op}
                  </button>
                ))}
              </div>
              {actividad.respuesta_correcta !== undefined && opcionSeleccionada !== null && (
                <div className={`rounded-xl p-3 text-sm font-medium ${opcionSeleccionada === actividad.respuesta_correcta ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {opcionSeleccionada === actividad.respuesta_correcta ? '✅ ¡Correcto! Bien pensado.' : `❌ La respuesta correcta es: "${actividad.opciones[actividad.respuesta_correcta]}"`}
                </div>
              )}
            </div>
          )}

          {/* TEXTO */}
          {actividad.verificacion === 'texto' && (
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              {actividad.historia && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 italic border-l-4 border-purple-400">
                  "{actividad.historia}"
                </div>
              )}
              {actividad.campos ? (
                <div className="space-y-3">
                  {actividad.campos.map((campo, i) => (
                    <div key={i}>
                      <label className="text-sm text-gray-600 font-medium block mb-1">{campo}</label>
                      <textarea
                        rows={2}
                        placeholder="Escribe tu respuesta aquí..."
                        onChange={e => setRespuesta(e.target.value + '|')}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  rows={5}
                  value={respuesta}
                  onChange={e => setRespuesta(e.target.value)}
                  placeholder="Escribe tu reflexión aquí... (mín. 20 caracteres)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              )}
              {actividad.preguntas && actividad.preguntas.map((p, i) => (
                <div key={i}>
                  <label className="text-sm text-gray-600 font-medium block mb-1">{p}</label>
                  <textarea rows={2} onChange={e => setRespuesta(e.target.value + '|')} placeholder="Tu respuesta..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
              ))}
              <p className="text-xs text-gray-400">{respuesta.length} / 20 mínimo</p>
            </div>
          )}

          {/* TIMER */}
          {actividad.verificacion === 'timer' && (
            <div className="bg-white rounded-2xl p-5 shadow-sm text-center space-y-4">
              {actividad.retos_posibles && (
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Tu reto de hoy:</p>
                  <p className="text-xl font-bold text-orange-600">
                    {actividad.retos_posibles[Math.floor(Math.random() * actividad.retos_posibles.length)]}
                  </p>
                </div>
              )}
              {actividad.pasos && (
                <div className="space-y-2 text-left">
                  {actividad.pasos.map((p, i) => (
                    <div key={i} className={`flex gap-3 items-center p-2 rounded-lg ${pasoTimer === i ? 'bg-purple-50' : ''}`}>
                      <span className="text-lg">{['🫁', '🤐', '😮‍💨'][i]}</span>
                      <span className="text-sm text-gray-700">{p}</span>
                    </div>
                  ))}
                </div>
              )}
              {!timerActivo ? (
                <button
                  onClick={() => iniciarTimer(actividad.pasos ? (4 + 7 + 8) * (actividad.repeticiones || 3) : 300)}
                  className={`w-full ${ambito.bg} text-white py-4 rounded-xl font-bold text-lg active:scale-95`}
                >
                  ▶ Iniciar Timer
                </button>
              ) : (
                <div className="space-y-3">
                  <div className={`${ambito.bgLight || 'bg-gray-50'} rounded-2xl p-6`}>
                    <div className="text-6xl font-bold text-gray-800">
                      {Math.floor(segundosRestantes / 60)}:{String(segundosRestantes % 60).padStart(2, '0')}
                    </div>
                    <p className="text-gray-500 text-sm mt-2">¡No cierres la app! 💪</p>
                  </div>
                  <button onClick={() => { clearInterval(intervalRef.current); setTimerActivo(false); handleCompletar() }} className="text-gray-400 text-sm underline">
                    Marcar como completado
                  </button>
                </div>
              )}
            </div>
          )}

          {/* HONOR */}
          {actividad.verificacion === 'honor' && (
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <p className="text-gray-700 font-medium">Elige tu hábito del día:</p>
              <div className="space-y-2">
                {actividad.opciones_habito?.map((op, i) => (
                  <button
                    key={i}
                    onClick={() => setHabitoSeleccionado(i)}
                    className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${habitoSeleccionado === i ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-gray-100 text-gray-600'}`}
                  >
                    {op}
                  </button>
                ))}
              </div>
              {habitoSeleccionado !== null && (
                <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700">
                  ✅ Hábito seleccionado. ¡Ponlo en práctica hoy!
                </div>
              )}
            </div>
          )}

          {/* SWIPE — Mitos vs Realidad con explicación */}
          {actividad.verificacion === 'swipe' && actividad.tarjetas && (
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              {swipeIndex < actividad.tarjetas.length ? (() => {
                const tarjeta = actividad.tarjetas[swipeIndex]
                const acerto = swipeRespuestaActual !== null && swipeRespuestaActual === tarjeta.esRealidad
                return (
                  <>
                    {/* Progreso */}
                    <div className="flex justify-between items-center">
                      <p className="text-gray-400 text-xs">Tarjeta {swipeIndex + 1} de {actividad.tarjetas.length}</p>
                      <div className="flex gap-1">
                        {actividad.tarjetas.map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i < swipeIndex ? 'bg-purple-400' : i === swipeIndex ? 'bg-yellow-400' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    </div>

                    {/* Afirmación */}
                    <div className="bg-pink-50 rounded-2xl p-5 text-center min-h-28 flex items-center justify-center border-2 border-pink-100">
                      <p className="text-gray-800 font-semibold">{tarjeta.texto}</p>
                    </div>

                    {/* Botones o Explicación */}
                    {swipeRespuestaActual === null ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => { setSwipeRespuestaActual(false); setSwipeRespuestas(r => [...r, false]) }}
                          className="bg-red-50 border-2 border-red-200 text-red-600 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all"
                        >
                          ❌ Mito
                        </button>
                        <button
                          onClick={() => { setSwipeRespuestaActual(true); setSwipeRespuestas(r => [...r, true]) }}
                          className="bg-green-50 border-2 border-green-200 text-green-600 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all"
                        >
                          ✅ Realidad
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Resultado */}
                        <div className={`rounded-xl p-3 text-center font-bold ${acerto ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {acerto ? '✅ ¡Correcto!' : `❌ Incorrecto — Es un ${tarjeta.esRealidad ? 'REALIDAD' : 'MITO'}`}
                        </div>
                        {/* Explicación */}
                        {tarjeta.explicacion && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-xs font-bold text-blue-600 mb-1">📚 ¿Por qué?</p>
                            <p className="text-sm text-blue-800 leading-relaxed">{tarjeta.explicacion}</p>
                          </div>
                        )}
                        <button
                          onClick={() => { setSwipeIndex(i => i + 1); setSwipeRespuestaActual(null) }}
                          className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold active:scale-95"
                        >
                          Siguiente →
                        </button>
                      </div>
                    )}
                  </>
                )
              })() : (
                <div className="text-center space-y-3 py-2">
                  <span className="text-5xl">🎉</span>
                  <p className="font-bold text-gray-800 text-lg">¡Terminaste!</p>
                  <div className="bg-purple-50 rounded-2xl p-4">
                    <p className="text-2xl font-bold text-purple-600">
                      {swipeRespuestas.filter((r, i) => r === actividad.tarjetas[i]?.esRealidad).length}
                      <span className="text-gray-400 text-lg"> / {actividad.tarjetas.length}</span>
                    </p>
                    <p className="text-gray-500 text-sm">respuestas correctas</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* JUEGOS INTERACTIVOS */}
          {actividad.verificacion === 'juego' && actividad.tipo === 'memorama' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <Memorama pares={actividad.pares} ambito={ambito} onCompletar={handleCompletar} />
            </div>
          )}
          {actividad.verificacion === 'juego' && actividad.tipo === 'trivia_veloz' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <TriviaVeloz preguntas={actividad.preguntas} ambito={ambito} onCompletar={handleCompletar} />
            </div>
          )}
          {actividad.verificacion === 'juego' && actividad.tipo === 'ahorcado' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <Ahorcado palabras={actividad.palabras} pistas={actividad.pistas} ambito={ambito} onCompletar={handleCompletar} />
            </div>
          )}
          {actividad.verificacion === 'juego' && actividad.tipo === 'sopa' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <SopaLetras palabras={actividad.palabras} ambito={ambito} onCompletar={handleCompletar} />
            </div>
          )}

          {/* Botón completar (solo para no-juegos y no-timer) */}
          {actividad.verificacion !== 'timer' && actividad.verificacion !== 'juego' && (
            <button
              onClick={handleCompletar}
              disabled={!puedeCompletar() || subiendoFoto}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${puedeCompletar() && !subiendoFoto ? `${ambito.bg} active:scale-95` : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              {subiendoFoto ? '📤 Subiendo foto...' : puedeCompletar() ? '¡Completar actividad! ✓' : 'Completa la actividad primero'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ——— FASE: DONE ———
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="text-center space-y-5 max-w-sm w-full">
        <div className="text-8xl">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800">¡Actividad completada!</h2>
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
          <div className="flex justify-center gap-8">
            <div>
              <p className="text-3xl font-bold text-yellow-500">+{actividad.xp}</p>
              <p className="text-xs text-gray-500">XP ganado</p>
            </div>
            {actividad.badge && (
              <div>
                <p className="text-3xl">{actividad.badge.split(' ')[0]}</p>
                <p className="text-xs text-gray-500">Badge nuevo</p>
              </div>
            )}
          </div>
          {actividad.badge && (
            <div className="bg-purple-50 rounded-2xl p-3">
              <p className="text-purple-700 font-semibold text-sm">{actividad.badge}</p>
              <p className="text-purple-400 text-xs">¡Badge desbloqueado!</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate(`/ambito/${ambitoId}`)} className="bg-white border border-gray-200 text-gray-700 py-3 rounded-2xl font-medium">
            Ver más actividades
          </button>
          <button onClick={() => navigate('/home')} className={`${ambito.bg} text-white py-3 rounded-2xl font-bold shadow`}>
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  )
}
