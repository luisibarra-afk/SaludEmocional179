import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { EMOCIONES, AMBITOS, FRASES_MOTIVACION, NIVELES, getSemanaActual, INICIO_SEMESTRE, FIN_SEMESTRE } from '../data/actividades'
import BubblePop from '../components/juegos/BubblePop'
import SnakeGame from '../components/juegos/SnakeGame'
import Juego2048 from '../components/juegos/Juego2048'
import FlappyBird from '../components/juegos/FlappyBird'

const JUEGOS = [
  { id: 'bubbles', emoji: '🫧', nombre: 'Bubble Pop', desc: 'Revienta todas las burbujas', grad: 'from-violet-500 to-purple-600' },
  { id: 'snake',   emoji: '🐍', nombre: 'Snake',      desc: 'Come sin chocarte',          grad: 'from-emerald-500 to-green-600' },
  { id: '2048',    emoji: '🔢', nombre: '2048',        desc: 'Combina hasta llegar a 2048', grad: 'from-amber-500 to-orange-500' },
  { id: 'flappy',  emoji: '🐦', nombre: 'Flappy Bird', desc: 'Vuela entre los tubos',      grad: 'from-sky-500 to-blue-600'    },
]

const HOY = new Date().toDateString()

// Árbol SVG animado que crece con el nivel
function Arbol({ nivel }) {
  const etapas = [
    // Semilla
    <g key="semilla">
      <ellipse cx="60" cy="90" rx="10" ry="6" fill="#92400e" opacity="0.6"/>
      <path d="M60 90 Q58 75 55 65" stroke="#16a34a" strokeWidth="2" fill="none"/>
      <ellipse cx="55" cy="63" rx="8" ry="6" fill="#4ade80"/>
    </g>,
    // Brote
    <g key="brote">
      <rect x="56" y="70" width="8" height="25" rx="3" fill="#92400e"/>
      <ellipse cx="60" cy="60" rx="18" ry="14" fill="#22c55e"/>
      <ellipse cx="45" cy="68" rx="10" ry="8" fill="#4ade80"/>
      <ellipse cx="75" cy="68" rx="10" ry="8" fill="#4ade80"/>
    </g>,
    // Árbol
    <g key="arbol">
      <rect x="54" y="60" width="12" height="35" rx="4" fill="#92400e"/>
      <ellipse cx="60" cy="45" rx="28" ry="22" fill="#16a34a"/>
      <ellipse cx="40" cy="58" rx="16" ry="12" fill="#22c55e"/>
      <ellipse cx="80" cy="58" rx="16" ry="12" fill="#22c55e"/>
      <ellipse cx="60" cy="30" rx="18" ry="14" fill="#4ade80"/>
    </g>,
    // Bosque
    <g key="bosque">
      <rect x="54" y="55" width="12" height="40" rx="4" fill="#78350f"/>
      <ellipse cx="60" cy="38" rx="32" ry="26" fill="#15803d"/>
      <ellipse cx="35" cy="52" rx="18" ry="14" fill="#16a34a"/>
      <ellipse cx="85" cy="52" rx="18" ry="14" fill="#16a34a"/>
      <ellipse cx="60" cy="22" rx="20" ry="16" fill="#4ade80"/>
      <circle cx="48" cy="30" r="5" fill="#bbf7d0"/>
      <circle cx="72" cy="28" r="4" fill="#bbf7d0"/>
      <circle cx="60" cy="15" r="3" fill="#fef08a"/>
    </g>,
  ]
  return (
    <svg viewBox="0 0 120 100" className="w-full h-full transition-all duration-700" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
      <ellipse cx="60" cy="96" rx="30" ry="5" fill="#d1fae5" opacity="0.5"/>
      <g style={{ transformOrigin: 'center bottom', animation: 'treeGrow 0.8s ease-out' }}>
        {etapas[nivel]}
      </g>
    </svg>
  )
}

export default function Home() {
  const { estado, registrarCheckin, getNivel, getProgreso, logout } = useApp()
  const navigate = useNavigate()

  const checkinLocal = estado.checkinHoy?.emocion || null

  const semanaActual = getSemanaActual()
  const totalSemanas = 12
  const progresoCiclo = Math.min((semanaActual / totalSemanas) * 100, 100)

  const nivel = getNivel()
  const nivelIndex = NIVELES.findIndex(n => n.nombre === nivel.nombre)
  const progresoXP = getProgreso()

  // Actividades desbloqueadas esta semana (semana === semanaActual) y no completadas
  const actividadesSemana = AMBITOS.flatMap(a =>
    a.actividades
      .filter(act => act.semana === semanaActual && !estado.completadas.includes(act.id))
      .map(act => ({ ...act, ambito: a }))
  )

  // Cuántas completó esta semana
  const completadasEstaSemana = AMBITOS.flatMap(a =>
    a.actividades.filter(act => act.semana === semanaActual && estado.completadas.includes(act.id))
  ).length

  const frase = FRASES_MOTIVACION[estado.xp % FRASES_MOTIVACION.length]
  const [juegoActivo, setJuegoActivo] = useState(null)

  const handleCheckin = (emocion) => {
    registrarCheckin(emocion)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header con árbol */}
      <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 text-white px-5 pt-8 pb-12 relative overflow-hidden">
        {/* Burbujas decorativas */}
        <div className="absolute top-4 right-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-16 right-16 w-12 h-12 bg-white/5 rounded-full pointer-events-none" />

        {/* Header compacto */}
        <div className="flex items-center justify-between gap-3">
          {/* Árbol pequeño */}
          <div className="w-14 h-14 flex-shrink-0">
            <Arbol nivel={nivelIndex} />
          </div>

          {/* Nombre + XP */}
          <div className="flex-1 min-w-0">
            <p className="text-purple-200 text-xs">¡Hola de nuevo!</p>
            <h2 className="text-base font-bold leading-tight truncate">{estado.usuario?.nombre} 👋</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">{nivel.emoji}</span>
              <div className="flex-1 bg-white/20 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full transition-all duration-700" style={{ width: `${progresoXP}%` }} />
              </div>
              <span className="text-purple-200 text-xs whitespace-nowrap">{estado.xp} XP</span>
            </div>
          </div>

          {/* Salir */}
          <button onClick={logout} className="text-purple-200 text-xs border border-purple-400 rounded-full px-3 py-1 flex-shrink-0">
            Salir
          </button>
        </div>
      </div>

      <div className="px-5 -mt-6 space-y-4">

        {/* Semana del semestre */}
        <div className="bg-white rounded-3xl shadow-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-bold text-gray-800">📅 Semana {semanaActual} de {totalSemanas}</p>
              <p className="text-gray-400 text-xs">Semestre Mar 23 – Jun 12, 2026</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">{completadasEstaSemana}<span className="text-gray-300 text-lg">/5</span></p>
              <p className="text-xs text-gray-400">esta semana</p>
            </div>
          </div>
          <div className="bg-gray-100 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-700" style={{ width: `${progresoCiclo}%` }} />
          </div>
          {/* Puntos de semanas */}
          <div className="flex justify-between mt-2 px-0.5">
            {Array.from({ length: totalSemanas }, (_, i) => i + 1).map(s => (
              <div key={s} className={`w-1.5 h-1.5 rounded-full ${s < semanaActual ? 'bg-purple-500' : s === semanaActual ? 'bg-yellow-400' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {/* Check-in emocional */}
        {!checkinLocal ? (
          <div className="bg-white rounded-3xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-1">¿Cómo llegaste hoy? 🌤️</h3>
            <p className="text-gray-400 text-xs mb-4">Tu emoción es válida. Toca para registrarla.</p>
            <div className="grid grid-cols-3 gap-2">
              {EMOCIONES.map(em => (
                <button
                  key={em.label}
                  onClick={() => handleCheckin(em)}
                  className="flex flex-col items-center gap-1 p-3 rounded-2xl border-2 border-gray-100 hover:border-purple-300 active:scale-95 transition-all"
                >
                  <span className="text-3xl">{em.emoji}</span>
                  <span className="text-xs text-gray-600 font-medium">{em.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl">
              {checkinLocal.emoji}
            </div>
            <div>
              <p className="font-semibold text-gray-800">Te sientes {checkinLocal.label} hoy</p>
              <p className="text-gray-400 text-xs">Check-in registrado ✓</p>
            </div>
            <button onClick={() => { sessionStorage.removeItem('checkin_' + HOY); setCheckinLocal(null) }} className="ml-auto text-gray-300 text-xs">
              cambiar
            </button>
          </div>
        )}

        {/* Frase */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 text-white">
          <p className="text-sm font-medium">💬 {frase}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-purple-600">{estado.completadas.length}</p>
            <p className="text-xs text-gray-400">Actividades</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-yellow-500">{estado.badges.length}</p>
            <p className="text-xs text-gray-400">Badges</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-500">{estado.xp}</p>
            <p className="text-xs text-gray-400">XP Total</p>
          </div>
        </div>

        {/* Zona de descanso — juegos */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">🎮 Zona de descanso</h3>
            <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">Relájate</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {JUEGOS.map(j => (
              <button
                key={j.id}
                onClick={() => setJuegoActivo(j.id)}
                className={`bg-gradient-to-br ${j.grad} rounded-2xl p-4 text-left shadow-md active:scale-95 transition-all`}
              >
                <p className="text-3xl mb-2">{j.emoji}</p>
                <p className="text-white font-bold text-sm">{j.nombre}</p>
                <p className="text-white/70 text-xs mt-0.5">{j.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Juego activo */}
        {juegoActivo === 'bubbles' && <BubblePop onClose={() => setJuegoActivo(null)} />}
        {juegoActivo === 'snake'   && <SnakeGame  onClose={() => setJuegoActivo(null)} />}
        {juegoActivo === '2048'    && <Juego2048  onClose={() => setJuegoActivo(null)} />}
        {juegoActivo === 'flappy'  && <FlappyBird onClose={() => setJuegoActivo(null)} />}

        <button onClick={() => navigate('/ambitos')} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg active:scale-95 transition-all">
          Ver toda la mochila 🎒
        </button>
      </div>
    </div>
  )
}
