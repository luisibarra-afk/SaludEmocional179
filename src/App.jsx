import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Home from './pages/Home'
import Ambitos from './pages/Ambitos'
import AmbitoDetalle from './pages/AmbitoDetalle'
import Actividad from './pages/Actividad'
import Progreso from './pages/Progreso'
import Docente from './pages/Docente'

function ProtectedRoute({ children }) {
  const { estado } = useApp()
  if (!estado.usuario) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/ambitos" element={<ProtectedRoute><Ambitos /></ProtectedRoute>} />
        <Route path="/ambito/:ambitoId" element={<ProtectedRoute><AmbitoDetalle /></ProtectedRoute>} />
        <Route path="/actividad/:ambitoId/:actividadId" element={<ProtectedRoute><Actividad /></ProtectedRoute>} />
        <Route path="/progreso" element={<ProtectedRoute><Progreso /></ProtectedRoute>} />
        <Route path="/docente" element={<ProtectedRoute><Docente /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="max-w-md mx-auto min-h-screen">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
