import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const moodEmojis = {
  feliz: '😊', triste: '😢', enojado: '😠',
  ansioso: '😰', cansado: '😴', nervioso: '😬',
};
const moodColors = {
  feliz: '#FDE68A', triste: '#BFDBFE', enojado: '#FCA5A5',
  ansioso: '#FED7AA', cansado: '#E5E7EB', nervioso: '#DDD6FE',
};

export default function TeacherView() {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [moodSummary, setMoodSummary] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    axios.get('/api/users/students').then(({ data }) => setStudents(data)).catch(() => {});
  }, []);

  const loadSummary = async (student) => {
    setSelectedStudent(student);
    setLoadingSummary(true);
    try {
      const { data } = await axios.get(`/api/diary/summary/${student.id}`);
      setMoodSummary(data);
    } finally {
      setLoadingSummary(false);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

  // Count mood frequencies
  const moodCounts = moodSummary.reduce((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1;
    return acc;
  }, {});
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{user?.avatar}</span>
          <div>
            <p className="font-black text-gray-800 leading-none">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600 font-semibold px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors">
          Salir
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-5">
        {/* Privacy notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <p className="text-blue-700 text-sm font-semibold">
            <strong>Privacidad:</strong> Solo puedes ver el estado de ánimo de cada alumno.
            El contenido del diario es completamente privado.
          </p>
        </div>

        <h2 className="text-xl font-black text-gray-800 mb-4">👥 Mis Alumnos ({students.length})</h2>

        {students.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-5xl">📋</span>
            <p className="mt-3 font-semibold">No hay alumnos registrados</p>
          </div>
        ) : (
          <div className="grid gap-3 mb-6">
            {students.map(s => (
              <button
                key={s.id}
                onClick={() => loadSummary(s)}
                className={`bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all text-left border-2 ${
                  selectedStudent?.id === s.id ? 'border-green-400 bg-green-50' : 'border-transparent'
                }`}
              >
                <span className="text-3xl">{s.avatar || '🎒'}</span>
                <div className="flex-1">
                  <p className="font-black text-gray-800">{s.name}</p>
                  <p className="text-sm text-gray-500">
                    {s.grade} &bull; 🔥 {s.streak || 0} días &bull; ⭐ {s.achievements?.length || 0} logros
                  </p>
                </div>
                <span className="text-gray-400 text-xl">›</span>
              </button>
            ))}
          </div>
        )}

        {/* Mood summary panel */}
        {selectedStudent && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedStudent.avatar}</span>
              <div>
                <h3 className="font-black text-gray-800 text-lg">{selectedStudent.name}</h3>
                <p className="text-sm text-gray-500">Historial emocional reciente</p>
              </div>
              {topMood && (
                <div className="ml-auto text-center">
                  <p className="text-2xl">{moodEmojis[topMood[0]]}</p>
                  <p className="text-xs text-gray-500">más frecuente</p>
                </div>
              )}
            </div>

            {loadingSummary ? (
              <p className="text-gray-400 text-sm text-center py-4">Cargando...</p>
            ) : moodSummary.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sin registros todavía.</p>
            ) : (
              <>
                {/* Mood frequency */}
                {Object.keys(moodCounts).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).map(([mood, count]) => (
                      <div
                        key={mood}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold"
                        style={{ backgroundColor: moodColors[mood] || '#E5E7EB' }}
                      >
                        <span>{moodEmojis[mood]}</span>
                        <span className="text-gray-700">{count}x</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent entries */}
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Últimas entradas</p>
                <div className="flex flex-wrap gap-2">
                  {moodSummary.slice(0, 15).map((entry, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center px-2 py-2 rounded-xl text-center min-w-[52px]"
                      style={{ backgroundColor: moodColors[entry.mood] || '#E5E7EB' }}
                    >
                      <span className="text-xl">{moodEmojis[entry.mood] || '😶'}</span>
                      <span className="text-xs text-gray-600 mt-1 leading-none">{formatDate(entry.date)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
