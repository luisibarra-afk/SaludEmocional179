import { useEffect, useRef, useCallback, useState } from 'react'

const W = 320
const H = 460
const BIRD_X = 70
const BIRD_R = 14
const GRAVITY = 0.42
const JUMP = -8.5
const PIPE_W = 54
const GAP = 145
const PIPE_SPEED = 2.6
const PIPE_EVERY = 95 // frames

export default function FlappyBird({ onClose }) {
  const canvasRef = useRef(null)
  const state = useRef(null)
  const rafRef = useRef(null)
  const [ui, setUi] = useState({ score: 0, over: false, started: false })

  function initState() {
    return {
      by: H / 2, bvy: 0,
      pipes: [],
      score: 0,
      frame: 0,
      started: false,
      over: false,
      bgX: 0,
    }
  }

  const jump = useCallback(() => {
    const s = state.current
    if (!s) return
    if (s.over) return
    if (!s.started) { s.started = true; setUi(u => ({ ...u, started: true })) }
    s.bvy = JUMP
  }, [])

  const reset = useCallback(() => {
    state.current = initState()
    setUi({ score: 0, over: false, started: false })
  }, [])

  useEffect(() => {
    state.current = initState()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function draw() {
      const s = state.current
      ctx.clearRect(0, 0, W, H)

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#1e3a5f')
      sky.addColorStop(1, '#4a90d9')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      // Clouds (decorative)
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath(); ctx.ellipse(60 - (s.bgX*0.3)%W, 60, 40, 20, 0, 0, Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(220 - (s.bgX*0.3)%W, 90, 50, 22, 0, 0, Math.PI*2); ctx.fill()

      // Ground
      ctx.fillStyle = '#5a9e3a'
      ctx.fillRect(0, H - 55, W, 55)
      ctx.fillStyle = '#8bc34a'
      ctx.fillRect(0, H - 55, W, 12)
      ctx.fillStyle = '#4a7c2a'
      ctx.fillRect(0, H - 18, W, 18)

      if (s.started) {
        // Physics
        if (!s.over) {
          s.bvy += GRAVITY
          s.by += s.bvy
          s.frame++
          s.bgX += 1

          // Spawn pipes
          if (s.frame % PIPE_EVERY === 0) {
            const gy = 70 + Math.random() * (H - 55 - GAP - 110)
            s.pipes.push({ x: W + 10, gy, passed: false })
          }
          // Move pipes
          s.pipes = s.pipes.map(p => ({ ...p, x: p.x - PIPE_SPEED })).filter(p => p.x > -PIPE_W - 10)

          // Score
          s.pipes.forEach(p => {
            if (!p.passed && p.x + PIPE_W < BIRD_X) {
              p.passed = true; s.score++
              setUi(u => ({ ...u, score: s.score }))
            }
          })

          // Collisions
          if (s.by + BIRD_R > H - 55 || s.by - BIRD_R < 0) {
            s.over = true; setUi(u => ({ ...u, over: true }))
          }
          for (const p of s.pipes) {
            if (BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W) {
              if (s.by - BIRD_R < p.gy || s.by + BIRD_R > p.gy + GAP) {
                s.over = true; setUi(u => ({ ...u, over: true }))
              }
            }
          }
        }
      }

      // Draw pipes
      s.pipes.forEach(p => {
        // Top pipe
        const grad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0)
        grad.addColorStop(0, '#5cb85c'); grad.addColorStop(0.5, '#82d882'); grad.addColorStop(1, '#4a9a4a')
        ctx.fillStyle = grad
        ctx.beginPath(); ctx.roundRect(p.x, 0, PIPE_W, p.gy, [0,0,6,6]); ctx.fill()
        ctx.fillStyle = '#3a7a3a'
        ctx.beginPath(); ctx.roundRect(p.x - 5, p.gy - 22, PIPE_W + 10, 22, [4,4,0,0]); ctx.fill()
        ctx.fillStyle = '#5cb85c'
        ctx.beginPath(); ctx.roundRect(p.x - 5, p.gy - 22, PIPE_W + 10, 22, [4,4,0,0]); ctx.fill()
        // Bottom pipe
        ctx.fillStyle = grad
        ctx.beginPath(); ctx.roundRect(p.x, p.gy + GAP, PIPE_W, H, [6,6,0,0]); ctx.fill()
        ctx.fillStyle = '#3a7a3a'
        ctx.beginPath(); ctx.roundRect(p.x - 5, p.gy + GAP, PIPE_W + 10, 22, [0,0,4,4]); ctx.fill()
        ctx.fillStyle = '#5cb85c'
        ctx.beginPath(); ctx.roundRect(p.x - 5, p.gy + GAP, PIPE_W + 10, 22, [0,0,4,4]); ctx.fill()
      })

      // Bird
      const angle = Math.min(Math.max(s.bvy * 0.05, -0.5), 0.8)
      ctx.save()
      ctx.translate(BIRD_X, s.by)
      ctx.rotate(angle)
      // Body
      const birdGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, BIRD_R)
      birdGrad.addColorStop(0, '#ffe066'); birdGrad.addColorStop(1, '#f5a623')
      ctx.fillStyle = birdGrad
      ctx.beginPath(); ctx.arc(0, 0, BIRD_R, 0, Math.PI*2); ctx.fill()
      // Wing
      ctx.fillStyle = '#f5a623'
      ctx.beginPath(); ctx.ellipse(-4, 4, 8, 5, -0.3, 0, Math.PI*2); ctx.fill()
      // Eye
      ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(6, -5, 5, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(7, -5, 3, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(8, -6, 1, 0, Math.PI*2); ctx.fill()
      // Beak
      ctx.fillStyle = '#ff6b35'
      ctx.beginPath(); ctx.moveTo(12, -2); ctx.lineTo(20, 0); ctx.lineTo(12, 3); ctx.closePath(); ctx.fill()
      ctx.restore()

      // Score
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.beginPath(); ctx.roundRect(W/2 - 35, 12, 70, 34, 10); ctx.fill()
      ctx.fillStyle = 'white'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(s.score, W/2, 36); ctx.textAlign = 'left'

      if (!s.started) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = 'white'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText('🐦 Toca para volar', W/2, H/2 - 10)
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '13px sans-serif'
        ctx.fillText('Toca la pantalla para saltar', W/2, H/2 + 16)
        ctx.textAlign = 'left'
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-[#1e3a5f] flex flex-col items-center">
      <div className="flex items-center justify-between w-full px-5 pt-10 pb-3">
        <p className="text-white font-bold text-xl">🐦 Flappy Bird</p>
        <button onClick={onClose} className="text-white/50 text-2xl">✕</button>
      </div>

      <canvas
        ref={canvasRef}
        width={W} height={H}
        style={{ borderRadius: 16, maxWidth: '100%', cursor: 'pointer', touchAction: 'none' }}
        onClick={jump}
        onTouchStart={(e) => { e.preventDefault(); jump() }}
      />

      {ui.over && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center">
          <div className="bg-[#1e3a5f] border border-blue-600 rounded-3xl p-8 text-center space-y-4 mx-8 shadow-2xl">
            <p className="text-5xl">💀</p>
            <p className="text-white font-bold text-xl">Game Over</p>
            <p className="text-yellow-400 font-black text-4xl">{ui.score}</p>
            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 bg-sky-500 text-white py-3 rounded-xl font-bold">Otra vez</button>
              <button onClick={onClose} className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold">Salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
