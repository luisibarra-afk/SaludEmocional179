import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Login() {
  const [pin, setPin] = useState('')
  const [rol, setRol] = useState('alumno')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { login } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pin.trim()) { setError('Ingresa tu PIN'); return }
    setCargando(true)
    setError('')
    const resultado = await login(pin.trim(), rol)
    setCargando(false)
    if (resultado.error) { setError(resultado.error); return }
    navigate(rol === 'docente' ? '/docente' : '/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-7xl mb-3">🎒</div>
          <h1 className="text-3xl font-bold text-white">Mochila</h1>
          <h1 className="text-3xl font-bold text-purple-200">Socioemocional</h1>
          <p className="text-purple-200 mt-2 text-sm">CBTIS 179 · Hidalgo</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-gray-800 font-semibold text-lg mb-4">¡Hola! Ingresa a tu espacio</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selector rol */}
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
              <button type="button" onClick={() => { setRol('alumno'); setPin(''); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${rol === 'alumno' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}>
                👨‍🎓 Alumno/a
              </button>
              <button type="button" onClick={() => { setRol('docente'); setPin(''); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${rol === 'docente' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}>
                👩‍🏫 Docente
              </button>
            </div>

            {rol === 'alumno' ? (
              <div>
                <label className="text-sm text-gray-600 font-medium block mb-1">
                  Últimos 4 dígitos de tu número de control
                </label>
                <input
                  type="number"
                  value={pin}
                  onChange={e => setPin(e.target.value.slice(0, 4))}
                  placeholder="Ej. 0032"
                  maxLength={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-2xl font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <p className="text-xs text-gray-400 mt-1 text-center">
                  Ejemplo: si tu no. control es 25313051790032 → escribe <strong>0032</strong>
                </p>
              </div>
            ) : (
              <div>
                <label className="text-sm text-gray-600 font-medium block mb-1">
                  Código de acceso docente
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="Código docente"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-60"
            >
              {cargando ? '⏳ Verificando...' : 'Entrar 🚀'}
            </button>
          </form>
        </div>

        <p className="text-center text-purple-300/60 text-xs mt-4">
          © 2026 Luis Eduardo Ibarra Hernández · CBTIS 179
        </p>
      </div>
    </div>
  )
}
