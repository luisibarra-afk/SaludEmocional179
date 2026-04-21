import { useState, useEffect, useRef, useCallback } from 'react'

function addTile(g) {
  const empty = []
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (g[r][c] === 0) empty.push([r, c])
  if (!empty.length) return
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  g[r][c] = Math.random() < 0.9 ? 2 : 4
}

function newGrid() {
  const g = Array.from({ length: 4 }, () => Array(4).fill(0))
  addTile(g); addTile(g)
  return g
}

function slideRow(row) {
  let r = row.filter(x => x !== 0)
  let pts = 0
  for (let i = 0; i < r.length - 1; i++) {
    if (r[i] === r[i + 1]) { r[i] *= 2; pts += r[i]; r.splice(i + 1, 1) }
  }
  while (r.length < 4) r.push(0)
  return { row: r, pts }
}

function applyMove(grid, dir) {
  const g = grid.map(r => [...r])
  let score = 0, moved = false

  const processRow = (row) => { const res = slideRow(row); score += res.pts; return res.row }

  if (dir === 'left') {
    for (let r = 0; r < 4; r++) {
      const res = processRow(g[r])
      if (res.join() !== g[r].join()) moved = true
      g[r] = res
    }
  } else if (dir === 'right') {
    for (let r = 0; r < 4; r++) {
      const rev = [...g[r]].reverse()
      const res = processRow(rev).reverse()
      if (res.join() !== g[r].join()) moved = true
      g[r] = res
    }
  } else if (dir === 'up') {
    for (let c = 0; c < 4; c++) {
      const col = [g[0][c], g[1][c], g[2][c], g[3][c]]
      const res = processRow(col)
      if (res.join() !== col.join()) moved = true
      for (let r = 0; r < 4; r++) g[r][c] = res[r]
    }
  } else {
    for (let c = 0; c < 4; c++) {
      const col = [g[3][c], g[2][c], g[1][c], g[0][c]]
      const res = processRow(col)
      if (res.join() !== col.join()) moved = true
      for (let r = 0; r < 4; r++) g[3 - r][c] = res[r]
    }
  }
  if (moved) addTile(g)
  return { g, score, moved }
}

function isOver(grid) {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return false
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return false
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return false
    }
  return true
}

const COLORS = {
  0: ['#cdc1b4', '#776e65'], 2: ['#eee4da', '#776e65'], 4: ['#ede0c8', '#776e65'],
  8: ['#f2b179', '#f9f6f2'], 16: ['#f59563', '#f9f6f2'], 32: ['#f67c5f', '#f9f6f2'],
  64: ['#f65e3b', '#f9f6f2'], 128: ['#edcf72', '#f9f6f2'], 256: ['#edcc61', '#f9f6f2'],
  512: ['#edc850', '#f9f6f2'], 1024: ['#edc53f', '#f9f6f2'], 2048: ['#edc22e', '#f9f6f2'],
}

export default function Juego2048({ onClose }) {
  const [grid, setGrid] = useState(newGrid)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [status, setStatus] = useState('playing') // 'playing' | 'won' | 'over'

  const doMove = useCallback((dir) => {
    setGrid(prev => {
      const { g, score: pts, moved } = applyMove(prev, dir)
      if (!moved) return prev
      setScore(s => { const ns = s + pts; setBest(b => Math.max(b, ns)); return ns })
      if (g.some(r => r.includes(2048))) setStatus('won')
      else if (isOver(g)) setStatus('over')
      return g
    })
  }, [])

  const reset = () => { setGrid(newGrid()); setScore(0); setStatus('playing') }

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }
      if (map[e.key]) { e.preventDefault(); doMove(map[e.key]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [doMove])

  // Swipe
  const touch = useRef(null)
  const onTS = (e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const onTE = (e) => {
    if (!touch.current) return
    const dx = e.changedTouches[0].clientX - touch.current.x
    const dy = e.changedTouches[0].clientY - touch.current.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return
    doMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'))
    touch.current = null
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-[#faf8ef]">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-5 pt-10 pb-4">
        <div>
          <p className="font-black text-4xl text-[#776e65]">2048</p>
          <p className="text-[#bbada0] text-xs">Desliza para combinar</p>
        </div>
        <div className="flex items-center gap-2">
          {[['SCORE', score], ['BEST', best]].map(([label, val]) => (
            <div key={label} className="bg-[#bbada0] rounded-xl px-3 py-1.5 text-center min-w-[64px]">
              <p className="text-[#f9f6f2] text-xs font-bold">{label}</p>
              <p className="text-white font-black text-lg leading-none">{val}</p>
            </div>
          ))}
          <div className="flex flex-col gap-1 ml-1">
            <button onClick={reset} className="bg-[#8f7a66] text-white text-xs px-3 py-1 rounded-lg font-bold">Nueva</button>
            <button onClick={onClose} className="bg-[#bbada0] text-white text-xs px-3 py-1 rounded-lg font-bold">Salir</button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        className="rounded-2xl p-2 select-none"
        style={{ background: '#bbada0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, width: 316, height: 316 }}
        onTouchStart={onTS} onTouchEnd={onTE}
      >
        {grid.flat().map((val, i) => {
          const [bg, fg] = COLORS[val] || ['#3c3a32', '#f9f6f2']
          return (
            <div
              key={i}
              style={{ background: bg, color: fg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {val !== 0 && (
                <span style={{ fontWeight: 900, fontSize: val >= 1024 ? 18 : val >= 128 ? 22 : 28 }}>
                  {val}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* D-pad */}
      <div className="mt-6 grid grid-cols-3 gap-2" style={{ width: 140 }}>
        {[['', ''], ['▲', 'up'], ['', ''],
          ['◄', 'left'], ['↺', null], ['►', 'right'],
          ['', ''], ['▼', 'down'], ['', '']
        ].map(([label, dir], i) => (
          label ? (
            <button
              key={i}
              onClick={() => dir ? doMove(dir) : reset()}
              className="bg-[#bbada0] text-[#776e65] font-bold rounded-xl py-3 text-lg hover:bg-[#a39489] transition-colors"
            >
              {label}
            </button>
          ) : <div key={i} />
        ))}
      </div>

      {/* Overlay */}
      {status !== 'playing' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-[#faf8ef] rounded-3xl p-8 text-center space-y-4 mx-8 shadow-2xl">
            <p className="text-5xl">{status === 'won' ? '🏆' : '😔'}</p>
            <p className="text-[#776e65] font-black text-2xl">{status === 'won' ? '¡2048!' : 'Game Over'}</p>
            <p className="text-[#bbada0] font-bold text-xl">{score} pts</p>
            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 bg-[#8f7a66] text-white py-3 rounded-xl font-bold">Nueva</button>
              <button onClick={onClose} className="flex-1 bg-[#bbada0] text-white py-3 rounded-xl font-bold">Salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
