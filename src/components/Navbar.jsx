import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const tabs = [
  { path: '/home', emoji: '🏠', label: 'Inicio' },
  { path: '/ambitos', emoji: '🎒', label: 'Mochila' },
  { path: '/progreso', emoji: '⭐', label: 'Logros' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { estado } = useApp()

  if (!estado.usuario || estado.usuario.rol === 'docente') return null
  if (location.pathname === '/' || location.pathname === '/actividad') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="max-w-md mx-auto flex">
        {tabs.map(tab => {
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-all ${active ? 'text-purple-600' : 'text-gray-400'}`}
            >
              <span className="text-xl">{tab.emoji}</span>
              <span className="text-xs font-medium">{tab.label}</span>
              {active && <div className="w-1 h-1 bg-purple-600 rounded-full" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
