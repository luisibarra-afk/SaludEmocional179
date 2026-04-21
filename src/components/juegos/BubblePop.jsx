import { useState, useCallback } from 'react'

const PALETTE = [
  '#FF6B9D','#C56BFF','#6BA3FF','#6BFFA0',
  '#FFD96B','#FF966B','#FF6B6B','#6BFFF0',
  '#FF6BDE','#9DFF6B','#FFA96B','#6BD4FF',
]

function makeBubbles() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: 44 + Math.random() * 56,
    left: 8 + Math.random() * 84,
    top: 6 + Math.random() * 88,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    alive: true,
    popping: false,
  }))
}

export default function BubblePop({ onClose }) {
  const [bubbles, setBubbles] = useState(makeBubbles)
  const [score, setScore] = useState(0)
  const [regenerating, setRegenerating] = useState(false)

  const pop = useCallback((id) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popping: true } : b))
    setScore(s => s + 1)
    setTimeout(() => {
      setBubbles(prev => {
        const next = prev.map(b => b.id === id ? { ...b, alive: false, popping: false } : b)
        if (next.every(b => !b.alive)) {
          setRegenerating(true)
          setTimeout(() => { setBubbles(makeBubbles()); setRegenerating(false) }, 500)
        }
        return next
      })
    }, 260)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)' }}>
      <div className="flex items-center justify-between px-5 pt-10 pb-3 flex-shrink-0">
        <div>
          <p className="text-white font-bold text-xl">🫧 Bubble Pop</p>
          <p className="text-blue-300 text-xs">Revienta todas las burbujas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-1.5 rounded-xl bg-white/10">
            <p className="text-white font-bold text-lg leading-none">{score}</p>
            <p className="text-blue-300 text-xs">reventadas</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl">✕</button>
        </div>
      </div>

      <div className="flex-1 relative mx-3 mb-4 rounded-3xl overflow-hidden bg-white/5">
        {regenerating && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <p className="text-white font-bold text-lg animate-pulse">¡Generando más! 🎉</p>
          </div>
        )}
        {bubbles.filter(b => b.alive).map(b => (
          <div
            key={b.id}
            onClick={() => !b.popping && pop(b.id)}
            style={{
              position: 'absolute',
              width: b.size,
              height: b.size,
              left: `${b.left}%`,
              top: `${b.top}%`,
              transform: `translate(-50%,-50%) scale(${b.popping ? 1.7 : 1})`,
              opacity: b.popping ? 0 : 1,
              transition: 'transform 0.26s ease-out, opacity 0.26s ease-out',
              borderRadius: '50%',
              background: `radial-gradient(circle at 32% 32%, rgba(255,255,255,0.6) 0%, ${b.color}cc 35%, ${b.color} 75%)`,
              boxShadow: `0 4px 20px ${b.color}55, inset 0 -3px 6px rgba(0,0,0,0.15)`,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  )
}
