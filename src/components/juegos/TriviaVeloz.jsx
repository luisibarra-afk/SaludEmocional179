import { useState, useEffect, useRef } from 'react'

export default function TriviaVeloz({ preguntas, ambito, onCompletar }) {
  const [idx, setIdx]           = useState(0)
  const [seleccion, setSeleccion] = useState(null)
  const [puntaje, setPuntaje]   = useState(0)
  const [tiempo, setTiempo]     = useState(10)
  const [terminado, setTerminado] = useState(false)
  const [resultados, setResultados] = useState([])
  const intervalRef = useRef(null)

  const pregunta = preguntas[idx]

  useEffect(() => {
    if (terminado || seleccion !== null) return
    intervalRef.current = setInterval(() => {
      setTiempo(t => {
        if (t <= 1) { clearInterval(intervalRef.current); avanzar(null); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [idx, seleccion, terminado])

  const avanzar = (elegida) => {
    clearInterval(intervalRef.current)
    const correcta = pregunta.correcta
    const bien = elegida === correcta
    setResultados(r => [...r, { bien, elegida, correcta }])
    if (bien) setPuntaje(p => p + 1)
    setSeleccion(elegida ?? -1)
    setTimeout(() => {
      if (idx + 1 >= preguntas.length) {
        setTerminado(true)
        setTimeout(() => onCompletar({ correctas: (bien ? puntaje + 1 : puntaje), total: preguntas.length }), 1500)
      } else {
        setIdx(i => i + 1)
        setSeleccion(null)
        setTiempo(10)
      }
    }, 800)
  }

  if (terminado) {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="text-6xl">{ puntaje >= preguntas.length * 0.6 ? '🏆' : '📚'}</div>
        <h3 className="font-bold text-xl text-gray-800">{puntaje} / {preguntas.length} correctas</h3>
        <p className="text-gray-500 text-sm">{ puntaje >= preguntas.length * 0.6 ? '¡Excelente conocimiento!' : '¡Sigue aprendiendo!'}</p>
      </div>
    )
  }

  const pct = (tiempo / 10) * 100

  return (
    <div className="space-y-4">
      {/* Progreso */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">Pregunta {idx + 1} de {preguntas.length}</span>
        <span className="text-xs font-bold text-purple-600">⭐ {puntaje} pts</span>
      </div>

      {/* Timer */}
      <div className="relative">
        <div className="bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${tiempo > 5 ? 'bg-green-400' : tiempo > 2 ? 'bg-yellow-400' : 'bg-red-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`absolute right-0 -top-5 text-xs font-bold ${tiempo <= 3 ? 'text-red-500' : 'text-gray-500'}`}>{tiempo}s</span>
      </div>

      {/* Pregunta */}
      <div className={`${ambito.bgLight} rounded-2xl p-4`}>
        <p className="font-semibold text-gray-800 text-center">{pregunta.pregunta}</p>
      </div>

      {/* Opciones */}
      <div className="grid grid-cols-1 gap-2">
        {pregunta.opciones.map((op, i) => {
          let estilo = 'bg-white border-2 border-gray-100 text-gray-700'
          if (seleccion !== null) {
            if (i === pregunta.correcta) estilo = 'bg-green-50 border-2 border-green-400 text-green-700 font-bold'
            else if (i === seleccion) estilo = 'bg-red-50 border-2 border-red-300 text-red-600'
            else estilo = 'bg-white border-2 border-gray-100 text-gray-400 opacity-50'
          }
          return (
            <button
              key={i}
              onClick={() => seleccion === null && avanzar(i)}
              className={`p-3 rounded-xl text-sm text-left transition-all ${estilo}`}
            >
              <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][i]}.</span>{op}
            </button>
          )
        })}
      </div>
    </div>
  )
}
