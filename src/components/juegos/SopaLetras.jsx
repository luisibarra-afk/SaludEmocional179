import { useState, useMemo } from 'react'

const LETRAS_RELLENO = 'ABCDEFGHIJKLMNOPRSTUVYZ'

function generarGrid(palabras, tam = 10) {
  const grid = Array(tam).fill(null).map(() => Array(tam).fill(''))
  const colocadas = []

  for (const pal of palabras) {
    const p = pal.replace(/\s/g, '').toUpperCase()
    let puesto = false
    for (let intento = 0; intento < 200 && !puesto; intento++) {
      const horiz = Math.random() > 0.5
      if (horiz) {
        const r = Math.floor(Math.random() * tam)
        const c = Math.floor(Math.random() * (tam - p.length + 1))
        if (p.split('').every((l, i) => grid[r][c+i] === '' || grid[r][c+i] === l)) {
          p.split('').forEach((l, i) => { grid[r][c+i] = l })
          colocadas.push({ palabra: p, celdas: p.split('').map((_, i) => `${r},${c+i}`) })
          puesto = true
        }
      } else {
        const r = Math.floor(Math.random() * (tam - p.length + 1))
        const c = Math.floor(Math.random() * tam)
        if (p.split('').every((l, i) => grid[r+i][c] === '' || grid[r+i][c] === l)) {
          p.split('').forEach((l, i) => { grid[r+i][c] = l })
          colocadas.push({ palabra: p, celdas: p.split('').map((_, i) => `${r+i},${c}`) })
          puesto = true
        }
      }
    }
  }

  // Rellenar vacíos
  for (let r = 0; r < tam; r++)
    for (let c = 0; c < tam; c++)
      if (grid[r][c] === '')
        grid[r][c] = LETRAS_RELLENO[Math.floor(Math.random() * LETRAS_RELLENO.length)]

  return { grid, colocadas }
}

export default function SopaLetras({ palabras, ambito, onCompletar }) {
  const { grid, colocadas } = useMemo(() => generarGrid(palabras), [])
  const [seleccion, setSeleccion]   = useState([]) // celdas tocadas
  const [encontradas, setEncontradas] = useState([]) // palabras encontradas (celdas)
  const [inicio, setInicio]         = useState(null)
  const [arrastrando, setArrastrando] = useState(false)

  const celdaKey = (r, c) => `${r},${c}`
  const estaEncontrada = (r, c) => encontradas.flat().includes(celdaKey(r, c))
  const estaSeleccionada = (r, c) => seleccion.includes(celdaKey(r, c))

  const iniciarSeleccion = (r, c) => {
    setInicio({ r, c })
    setSeleccion([celdaKey(r, c)])
    setArrastrando(true)
  }

  const extenderSeleccion = (r, c) => {
    if (!arrastrando || !inicio) return
    // Solo horizontal o vertical
    const dr = r - inicio.r
    const dc = c - inicio.c
    let celdas = []
    if (dc === 0) { // vertical
      const step = dr > 0 ? 1 : -1
      for (let i = 0; Math.abs(i) <= Math.abs(dr); i += step)
        celdas.push(celdaKey(inicio.r + i, inicio.c))
    } else if (dr === 0) { // horizontal
      const step = dc > 0 ? 1 : -1
      for (let i = 0; Math.abs(i) <= Math.abs(dc); i += step)
        celdas.push(celdaKey(inicio.r, inicio.c + i))
    } else {
      celdas = [celdaKey(r, c)]
    }
    setSeleccion(celdas)
  }

  const terminarSeleccion = () => {
    setArrastrando(false)
    // Verificar si la selección forma una palabra
    const selStr = seleccion.map(k => {
      const [r, c] = k.split(',').map(Number)
      return grid[r][c]
    }).join('')
    const revStr = selStr.split('').reverse().join('')

    const match = colocadas.find(co =>
      co.celdas.join(',') === seleccion.join(',') ||
      co.celdas.join(',') === [...seleccion].reverse().join(',')
    )

    if (match && !encontradas.some(e => e.join(',') === match.celdas.join(','))) {
      const nuevas = [...encontradas, match.celdas]
      setEncontradas(nuevas)
      if (nuevas.length >= palabras.length) {
        setTimeout(() => onCompletar({ encontradas: palabras.length, total: palabras.length }), 1000)
      }
    }
    setSeleccion([])
    setInicio(null)
  }

  const encontradasNombres = encontradas.map(celdas => {
    const co = colocadas.find(c => c.celdas.join(',') === celdas.join(','))
    return co?.palabra || ''
  })

  return (
    <div className="space-y-4 select-none">
      {/* Palabras a encontrar */}
      <div className="flex flex-wrap gap-2">
        {palabras.map(p => {
          const hallada = encontradasNombres.includes(p.replace(/\s/g, '').toUpperCase())
          return (
            <span key={p} className={`px-2 py-1 rounded-full text-xs font-bold border ${hallada ? 'bg-green-100 text-green-700 border-green-200 line-through' : `${ambito.bgLight} ${ambito.text} border-current`}`}>
              {hallada ? '✓ ' : ''}{p}
            </span>
          )
        })}
      </div>

      {/* Grid */}
      <div
        className="grid gap-0.5 mx-auto"
        style={{ gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`, touchAction: 'none' }}
        onMouseLeave={terminarSeleccion}
      >
        {grid.map((fila, r) =>
          fila.map((letra, c) => {
            const encontrada = estaEncontrada(r, c)
            const selec = estaSeleccionada(r, c)
            return (
              <div
                key={celdaKey(r, c)}
                onMouseDown={() => iniciarSeleccion(r, c)}
                onMouseEnter={() => extenderSeleccion(r, c)}
                onMouseUp={terminarSeleccion}
                onTouchStart={(e) => { e.preventDefault(); iniciarSeleccion(r, c) }}
                onTouchMove={(e) => {
                  e.preventDefault()
                  const t = e.touches[0]
                  const el = document.elementFromPoint(t.clientX, t.clientY)
                  if (el?.dataset?.r) extenderSeleccion(Number(el.dataset.r), Number(el.dataset.c))
                }}
                onTouchEnd={terminarSeleccion}
                data-r={r} data-c={c}
                className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded cursor-pointer transition-all
                  ${encontrada ? `${ambito.bg} text-white` : selec ? 'bg-yellow-300 text-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {letra}
              </div>
            )
          })
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        {encontradasNombres.length}/{palabras.length} palabras · Arrastra para seleccionar
      </p>
    </div>
  )
}
