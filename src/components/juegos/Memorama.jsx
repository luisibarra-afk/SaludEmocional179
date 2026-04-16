import { useState, useEffect } from 'react'

function mezclar(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function Memorama({ pares, ambito, onCompletar }) {
  const [cartas, setCartas] = useState(() => {
    const todas = pares.flatMap((p, i) => [
      { id: `t${i}`, grupo: i, texto: p.term, tipo: 'term' },
      { id: `d${i}`, grupo: i, texto: p.def,  tipo: 'def'  },
    ])
    return mezclar(todas).map(c => ({ ...c, volteada: false, encontrada: false }))
  })
  const [seleccionadas, setSeleccionadas] = useState([])
  const [movimientos, setMovimientos] = useState(0)
  const [bloqueado, setBloqueado] = useState(false)
  const [ganado, setGanado] = useState(false)

  useEffect(() => {
    if (seleccionadas.length === 2) {
      setBloqueado(true)
      const [a, b] = seleccionadas
      const match = cartas[a].grupo === cartas[b].grupo
      setTimeout(() => {
        setCartas(cs => cs.map((c, i) => ({
          ...c,
          volteada: match && (i === a || i === b) ? true : (i === a || i === b) ? false : c.volteada,
          encontrada: match && (i === a || i === b) ? true : c.encontrada,
        })))
        setSeleccionadas([])
        setMovimientos(m => m + 1)
        setBloqueado(false)
      }, 900)
    }
  }, [seleccionadas])

  useEffect(() => {
    if (cartas.length > 0 && cartas.every(c => c.encontrada)) {
      setGanado(true)
      setTimeout(() => onCompletar({ movimientos, pares: pares.length }), 1200)
    }
  }, [cartas])

  const tocar = (idx) => {
    if (bloqueado || cartas[idx].encontrada || seleccionadas.includes(idx)) return
    if (seleccionadas.length === 2) return
    setCartas(cs => cs.map((c, i) => i === idx ? { ...c, volteada: true } : c))
    setSeleccionadas(s => [...s, idx])
  }

  const encontradas = cartas.filter(c => c.encontrada).length / 2

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Parejas encontradas: <span className="font-bold text-purple-600">{encontradas}/{pares.length}</span></p>
        <p className="text-sm text-gray-500">Movimientos: <span className="font-bold">{movimientos}</span></p>
      </div>

      {ganado && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <span className="text-3xl">🎉</span>
          <p className="text-green-700 font-bold mt-1">¡Memorama completado en {movimientos} movimientos!</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {cartas.map((carta, idx) => {
          const esta = seleccionadas.includes(idx)
          return (
            <button
              key={carta.id}
              onClick={() => tocar(idx)}
              className={`aspect-square rounded-xl text-xs font-medium transition-all duration-300 flex items-center justify-center p-1 text-center leading-tight
                ${carta.encontrada
                  ? `${ambito.bg} text-white opacity-70`
                  : carta.volteada || esta
                    ? 'bg-white border-2 border-purple-400 text-gray-700 shadow-md'
                    : `${ambito.bg} text-white shadow`
                }`}
            >
              {(carta.volteada || esta || carta.encontrada)
                ? <span>{carta.texto}</span>
                : <span className="text-xl">?</span>
              }
            </button>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 text-center">Toca dos cartas para encontrar parejas</p>
    </div>
  )
}
