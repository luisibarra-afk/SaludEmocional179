import { useEffect, useRef, useCallback, useState } from 'react'

const COLS = 20
const ROWS = 20
const CELL = 15
const SPEED = 130

const DIRS = { UP: [0,-1], DOWN: [0,1], LEFT: [-1,0], RIGHT: [1,0] }

function rFood(snake) {
  let p
  do { p = [Math.floor(Math.random()*COLS), Math.floor(Math.random()*ROWS)] }
  while (snake.some(s => s[0]===p[0] && s[1]===p[1]))
  return p
}

export default function SnakeGame({ onClose }) {
  const canvasRef = useRef(null)
  const game = useRef({
    snake: [[10,10],[9,10],[8,10]],
    food: [15,10],
    dir: DIRS.RIGHT,
    nextDir: DIRS.RIGHT,
    score: 0,
    started: false,
    over: false,
  })
  const intervalRef = useRef(null)
  const [display, setDisplay] = useState({ score: 0, over: false, started: false })

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const g = game.current
    const W = COLS * CELL, H = ROWS * CELL

    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, W, H)

    // Grid dots
    ctx.fillStyle = '#1f2937'
    for (let x = 0; x < COLS; x++)
      for (let y = 0; y < ROWS; y++) {
        ctx.fillRect(x*CELL + CELL/2 - 1, y*CELL + CELL/2 - 1, 2, 2)
      }

    // Food (pulsing red circle)
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(g.food[0]*CELL + CELL/2, g.food[1]*CELL + CELL/2, CELL/2 - 1, 0, Math.PI*2)
    ctx.fill()

    // Snake
    g.snake.forEach((s, i) => {
      const x = s[0]*CELL, y = s[1]*CELL
      if (i === 0) {
        ctx.fillStyle = '#4ade80'
        ctx.beginPath()
        ctx.roundRect(x+1, y+1, CELL-2, CELL-2, 4)
        ctx.fill()
        // Eyes
        ctx.fillStyle = '#052e16'
        ctx.fillRect(x+4, y+4, 3, 3)
        ctx.fillRect(x+8, y+4, 3, 3)
      } else {
        ctx.fillStyle = i % 2 === 0 ? '#16a34a' : '#15803d'
        ctx.beginPath()
        ctx.roundRect(x+1, y+1, CELL-2, CELL-2, 3)
        ctx.fill()
      }
    })

    if (!g.started) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#4ade80'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🐍 Toca para empezar', W/2, H/2 - 8)
      ctx.fillStyle = '#9ca3af'
      ctx.font = '12px sans-serif'
      ctx.fillText('Desliza o usa el D-Pad', W/2, H/2 + 14)
      ctx.textAlign = 'left'
    }
  }, [])

  const tick = useCallback(() => {
    const g = game.current
    if (!g.started || g.over) return
    g.dir = g.nextDir
    const head = g.snake[0]
    const nh = [head[0]+g.dir[0], head[1]+g.dir[1]]

    if (nh[0]<0||nh[0]>=COLS||nh[1]<0||nh[1]>=ROWS || g.snake.some(s=>s[0]===nh[0]&&s[1]===nh[1])) {
      g.over = true
      setDisplay(d => ({ ...d, over: true, score: g.score }))
      return
    }

    const ate = nh[0]===g.food[0] && nh[1]===g.food[1]
    g.snake = ate ? [nh,...g.snake] : [nh,...g.snake.slice(0,-1)]
    if (ate) {
      g.food = rFood(g.snake)
      g.score += 10
      setDisplay(d => ({ ...d, score: g.score }))
    }
    draw()
  }, [draw])

  const changeDir = useCallback((nd) => {
    const g = game.current
    const [cx,cy] = g.dir
    if (nd[0]===-cx && nd[1]===-cy) return
    g.nextDir = nd
  }, [])

  const start = useCallback(() => {
    const g = game.current
    if (!g.started) { g.started = true; setDisplay(d => ({ ...d, started: true })) }
  }, [])

  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    game.current = {
      snake: [[10,10],[9,10],[8,10]],
      food: [15,10],
      dir: DIRS.RIGHT,
      nextDir: DIRS.RIGHT,
      score: 0, started: false, over: false,
    }
    setDisplay({ score: 0, over: false, started: false })
    draw()
    intervalRef.current = setInterval(tick, SPEED)
  }, [draw, tick])

  useEffect(() => {
    draw()
    intervalRef.current = setInterval(tick, SPEED)
    return () => clearInterval(intervalRef.current)
  }, [draw, tick])

  // Touch swipe on canvas
  const touch = useRef(null)
  const onTS = (e) => { e.preventDefault(); touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; start() }
  const onTE = (e) => {
    if (!touch.current) return
    const dx = e.changedTouches[0].clientX - touch.current.x
    const dy = e.changedTouches[0].clientY - touch.current.y
    if (Math.max(Math.abs(dx),Math.abs(dy)) < 15) return
    if (Math.abs(dx) > Math.abs(dy)) changeDir(dx>0 ? DIRS.RIGHT : DIRS.LEFT)
    else changeDir(dy>0 ? DIRS.DOWN : DIRS.UP)
    touch.current = null
  }

  const W = COLS*CELL, H = ROWS*CELL

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center">
      <div className="flex items-center justify-between w-full px-5 pt-10 pb-3">
        <div>
          <p className="text-white font-bold text-xl">🐍 Snake</p>
          <p className="text-gray-400 text-xs">Come sin chocarte</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 rounded-xl px-3 py-1 text-center">
            <p className="text-white font-bold text-lg leading-none">{display.score}</p>
            <p className="text-gray-400 text-xs">pts</p>
          </div>
          <button onClick={onClose} className="text-gray-400 text-2xl">✕</button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={W} height={H}
        style={{ borderRadius: 16, cursor: 'pointer', touchAction: 'none' }}
        onClick={start}
        onTouchStart={onTS}
        onTouchEnd={onTE}
      />

      {/* D-Pad */}
      <div className="mt-4 grid grid-cols-3 gap-2" style={{ width: 144 }}>
        {[
          [null,    '▲', 'UP'],
          ['◄',  'LEFT', null],
          ['●',  null,   null],
          ['►',  'RIGHT',null],
          [null,  '▼',   'DOWN'],
        ].map((_, i) => null)}
        <div />
        <button onClick={() => { start(); changeDir(DIRS.UP) }}   className="bg-white/10 text-white py-3 rounded-xl font-bold text-lg">▲</button>
        <div />
        <button onClick={() => { start(); changeDir(DIRS.LEFT) }} className="bg-white/10 text-white py-3 rounded-xl font-bold text-lg">◄</button>
        <button onClick={start}                                    className="bg-green-900 text-green-400 py-3 rounded-xl font-bold">▶</button>
        <button onClick={() => { start(); changeDir(DIRS.RIGHT) }} className="bg-white/10 text-white py-3 rounded-xl font-bold text-lg">►</button>
        <div />
        <button onClick={() => { start(); changeDir(DIRS.DOWN) }}  className="bg-white/10 text-white py-3 rounded-xl font-bold text-lg">▼</button>
        <div />
      </div>

      {display.over && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 text-center space-y-4 mx-8">
            <p className="text-5xl">💀</p>
            <p className="text-white font-bold text-xl">Game Over</p>
            <p className="text-green-400 font-black text-3xl">{display.score} pts</p>
            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">Otra vez</button>
              <button onClick={onClose} className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold">Salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
