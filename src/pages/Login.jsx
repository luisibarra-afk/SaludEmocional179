import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Login() {
  const [matricula, setMatricula] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState('alumno')
  const [error, setError] = useState('')
  const { login } = useApp()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!matricula.trim() || !nombre.trim()) {
      setError('Por favor completa todos los campos')
      return
    }
    login(matricula.trim(), nombre.trim(), rol)
    navigate(rol === 'docente' ? '/docente' : '/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-7xl mb-3">🎒</div>
          <h1 className="text-3xl font-bold text-white">Mochila</h1>
          <h1 className="text-3xl font-bold text-purple-200">Socioemocional</h1>
          <p className="text-purple-200 mt-2 text-sm">CBTIS / CETIS — Hidalgo</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-gray-800 font-semibold text-lg mb-4">¡Hola! Ingresa a tu espacio</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setRol('alumno')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${rol === 'alumno' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}
              >
                👨‍🎓 Alumno/a
              </button>
              <button
                type="button"
                onClick={() => setRol('docente')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${rol === 'docente' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}
              >
                👩‍🏫 Docente
              </button>
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">
                {rol === 'alumno' ? 'Matrícula' : 'Número de Empleado'}
              </label>
              <input
                type="text"
                value={matricula}
                onChange={e => setMatricula(e.target.value)}
                placeholder={rol === 'alumno' ? 'Ej. 2024ABC001' : 'Ej. DOC001'}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">Tu nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej. María González"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Entrar 🚀
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
