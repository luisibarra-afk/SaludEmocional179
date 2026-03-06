import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  { label: 'Alumno', email: 'alumno@mochila.mx', password: 'alumno123', icon: '🎒' },
  { label: 'Maestra', email: 'maestra@mochila.mx', password: 'maestra123', icon: '👩‍🏫' },
  { label: 'Papá', email: 'papa@mochila.mx', password: 'papa123', icon: '👨‍👦' },
  { label: 'Admin', email: 'admin@mochila.mx', password: 'admin123', icon: '🔑' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = (role) => {
    if (role === 'alumno') navigate('/');
    else if (role === 'maestro' || role === 'admin') navigate('/maestro');
    else navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch {
      setError('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const loginAs = async (demo) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(demo.email, demo.password);
      redirectByRole(user.role);
    } catch {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-amber-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-8xl inline-block float-animation">🎒</span>
          <h1 className="text-4xl font-black text-green-800 mt-3">Mi Mochila</h1>
          <p className="text-green-600 font-semibold mt-1">Tu espacio de bienestar</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-700 mb-6 text-center">¡Bienvenido de vuelta!</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Correo</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400 transition-colors font-medium"
                placeholder="tu@correo.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400 transition-colors font-medium"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm font-semibold text-center bg-red-50 py-2 rounded-xl">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-xl transition-colors disabled:opacity-50 text-lg"
            >
              {loading ? 'Entrando...' : 'Entrar 🚀'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6">
            <p className="text-xs text-gray-400 text-center mb-3 font-bold tracking-wider">CUENTAS DE DEMO</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(d => (
                <button
                  key={d.label}
                  onClick={() => loginAs(d)}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-green-50 border-2 border-gray-200 hover:border-green-300 rounded-xl px-3 py-2 text-sm font-bold transition-all disabled:opacity-50"
                >
                  <span className="text-xl">{d.icon}</span>
                  <span className="text-gray-700">{d.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
