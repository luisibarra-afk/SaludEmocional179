import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Diary from './pages/Diary';
import Games from './pages/Games';
import Achievements from './pages/Achievements';
import TeacherView from './pages/TeacherView';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-amber-50">
        <div className="text-6xl float-animation">🎒</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/diario" element={<PrivateRoute roles={['alumno']}><Diary /></PrivateRoute>} />
          <Route path="/relajacion" element={<PrivateRoute roles={['alumno']}><Games /></PrivateRoute>} />
          <Route path="/logros" element={<PrivateRoute roles={['alumno']}><Achievements /></PrivateRoute>} />
          <Route path="/maestro" element={<PrivateRoute roles={['maestro', 'admin']}><TeacherView /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
