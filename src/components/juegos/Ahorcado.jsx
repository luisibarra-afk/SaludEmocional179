import { useState } from 'react'

const VIDAS_EMOJI = ['😊', '😐', '😟', '😰', '😨', '😱', '💀']
const LETRAS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

export default function Ahorcado({ palabras: lista, pistas, ambito, onCompletar }) {
  const [turno, setTurno]       = useState(0)
  const [intentos, setIntentos] = useState([])
  const [errores, setErrores]   = useState(0)
  const [ganados, setGanados]   = useState(0)
  const [fase, setFase]         = useState('jugando') // jugando | ganaste | perdiste | fin

  const palabra = lista[turno]?.toUpperCase() || ''
  const pista   = pistas[turno] || ''
  const maxErr  = 6

  const tocarLetra = (letra) => {
    if (intentos.includes(letra) || fase !== 'jugando') return
    const nuevos = [...intentos, letra]
    setIntentos(nuevos)
    const fallo = !palabra.includes(letra)
    const nuevosErrores = fallo ? errores + 1 : errores

    const completa = palabra.split('').every(l => l === ' ' || nuevos.includes(l))

    if (nuevosErrores >= maxErr) {
      setErrores(nuevosErrores)
      setFase('perdiste')
    } else if (completa) {
      setErrores(nuevosErrores)
      setGanados(g => g + 1)
      setFase('ganaste')
    } else {
      setErrores(nuevosErrores)
    }
  }

  const siguiente = () => {
    const sig = turno + 1
    if (sig >= lista.length) {
      onCompletar({ ganadas: ganados, total: lista.length })
    } else {
      setTurno(sig)
      setIntentos([])
      setErrores(0)
      setFase('jugando')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">Palabra {turno + 1} de {lista.length}</span>
        <span className="text-xs text-gray-500">Ganadas: <span className="font-bold text-green-600">{ganados}</span></span>
      </div>

      {/* Emoji de vida */}
      <div className="text-center">
        <span className="text-6xl transition-all">{VIDAS_EMOJI[errores]}</span>
        <div className="flex justify-center gap-1 mt-2">
          {Array.from({ length: maxErr }).map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i < errores ? 'bg-red-400' : 'bg-gray-200'}`} />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">{maxErr - errores} intentos restantes</p>
      </div>

      {/* Pista */}
      <div className={`${ambito.bgLight} rounded-xl p-3 text-center`}>
        <p className="text-xs text-gray-500">Pista:</p>
        <p className="text-sm font-medium text-gray-700">{pista}</p>
      </div>

      {/* Palabra */}
      <div className="flex justify-center gap-2 flex-wrap">
        {palabra.split('').map((l, i) => (
          <div key={i} className={`w-8 h-10 border-b-2 flex items-end justify-center pb-1 ${l === ' ' ? 'border-transparent' : 'border-gray-400'}`}>
            <span className={`text-lg font-bold ${intentos.includes(l) ? ambito.text : 'text-transparent'}`}>
              {l === ' ' ? ' ' : l}
            </span>
          </div>
        ))}
      </div>

      {/* Resultado */}
      {fase !== 'jugando' && (
        <div className={`rounded-2xl p-4 text-center ${fase === 'ganaste' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`font-bold ${fase === 'ganaste' ? 'text-green-700' : 'text-red-700'}`}>
            {fase === 'ganaste' ? '🎉 ¡Correcto!' : `😢 Era: ${palabra}`}
          </p>
          <button onClick={siguiente} className={`mt-2 px-4 py-2 rounded-xl text-white text-sm font-bold ${ambito.bg}`}>
            {turno + 1 >= lista.length ? 'Terminar' : 'Siguiente palabra →'}
          </button>
        </div>
      )}

      {/* Teclado */}
      {fase === 'jugando' && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {LETRAS.map(l => (
            <button
              key={l}
              onClick={() => tocarLetra(l)}
              disabled={intentos.includes(l)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                intentos.includes(l)
                  ? palabra.includes(l) ? 'bg-green-200 text-green-700' : 'bg-red-100 text-red-400 opacity-40'
                  : `${ambito.bg} text-white active:scale-90`
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
