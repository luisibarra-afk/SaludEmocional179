import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const moods = [
  { key: 'feliz', label: 'Feliz', emoji: '😊', bg: 'bg-yellow-100', border: 'border-yellow-300', selected: 'bg-yellow-300 border-yellow-400' },
  { key: 'triste', label: 'Triste', emoji: '😢', bg: 'bg-blue-100', border: 'border-blue-300', selected: 'bg-blue-300 border-blue-400' },
  { key: 'enojado', label: 'Enojado', emoji: '😠', bg: 'bg-red-100', border: 'border-red-300', selected: 'bg-red-300 border-red-400' },
  { key: 'ansioso', label: 'Ansioso', emoji: '😰', bg: 'bg-orange-100', border: 'border-orange-300', selected: 'bg-orange-300 border-orange-400' },
  { key: 'cansado', label: 'Cansado', emoji: '😴', bg: 'bg-gray-100', border: 'border-gray-300', selected: 'bg-gray-300 border-gray-400' },
  { key: 'nervioso', label: 'Nervioso', emoji: '😬', bg: 'bg-purple-100', border: 'border-purple-300', selected: 'bg-purple-300 border-purple-400' },
];

const pageColors = ['#FDE68A', '#BFDBFE', '#BBF7D0', '#FCA5A5', '#DDD6FE', '#FED7AA'];

const prompts = [
  '¿Qué pasó hoy? ¿Cómo te sentiste?',
  '¿Qué fue lo mejor de tu día?',
  '¿Algo te preocupó hoy? ¿Cómo lo manejaste?',
  '¿A quién le agradeces algo hoy?',
  '¿Qué aprendiste de ti mismo hoy?',
];

export default function Diary() {
  const navigate = useNavigate();
  const [mood, setMood] = useState(null);
  const [text, setText] = useState('');
  const [color, setColor] = useState(pageColors[0]);
  const [tip, setTip] = useState('');
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('write');
  const [saved, setSaved] = useState(false);
  const prompt = prompts[new Date().getDay() % prompts.length];

  useEffect(() => { loadEntries(); }, []);

  useEffect(() => {
    if (mood) {
      axios.get(`/api/tips/${mood}`).then(({ data }) => setTip(data.tip)).catch(() => {});
    } else {
      setTip('');
    }
  }, [mood]);

  const loadEntries = async () => {
    try {
      const { data } = await axios.get('/api/diary');
      setEntries(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!mood || !text.trim()) return;
    setSaving(true);
    try {
      await axios.post('/api/diary', { mood, text, color });
      setSaved(true);
      setText('');
      setMood(null);
      setTip('');
      loadEntries();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta entrada?')) return;
    try {
      await axios.delete(`/api/diary/${id}`);
      loadEntries();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">‹</button>
        <h1 className="text-xl font-black text-gray-800">📔 Mi Diario</h1>
        <div className="ml-auto flex gap-1">
          {['write', 'history'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${view === v ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {v === 'write' ? 'Escribir' : `Historial (${entries.length})`}
            </button>
          ))}
        </div>
      </div>

      {view === 'write' ? (
        <div className="max-w-md mx-auto p-4 space-y-4">
          {saved && (
            <div className="bg-green-100 border-2 border-green-300 rounded-2xl p-3 text-center text-green-700 font-bold">
              ✅ ¡Entrada guardada!
            </div>
          )}

          {/* Mood selector */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-bold text-gray-700 mb-3">¿Cómo te sientes hoy?</p>
            <div className="grid grid-cols-3 gap-2">
              {moods.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    mood === m.key
                      ? `${m.selected} shadow-md scale-105`
                      : `${m.bg} ${m.border} hover:scale-105`
                  }`}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-xs font-bold mt-1 text-gray-700">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tip */}
          {tip && (
            <div className="bg-white border-l-4 border-purple-400 rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-black text-purple-500 mb-1">💡 CONSEJO PARA TI</p>
              <p className="text-gray-700 font-semibold">{tip}</p>
            </div>
          )}

          {/* Page color */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-bold text-gray-700 mb-3">Color de tu página</p>
            <div className="flex gap-2">
              {pageColors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full transition-all ${color === c ? 'ring-4 ring-gray-500 scale-125' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Write area */}
          <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: color }}>
            <p className="font-bold text-gray-600 mb-2 text-sm">💬 {prompt}</p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={6}
              placeholder="Escribe libremente aquí..."
              className="w-full bg-white/70 backdrop-blur rounded-xl p-3 text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 font-medium"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">{text.length} caracteres</span>
              <button
                onClick={handleSave}
                disabled={!mood || !text.trim() || saving}
                className="bg-purple-600 hover:bg-purple-700 text-white font-black px-6 py-2 rounded-xl transition-all disabled:opacity-40 active:scale-95"
              >
                {saving ? 'Guardando...' : 'Guardar ✨'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto p-4 space-y-3">
          {entries.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl">📭</span>
              <p className="text-gray-500 font-semibold mt-4">Todavía no tienes entradas</p>
              <button
                onClick={() => setView('write')}
                className="mt-3 text-purple-600 font-black hover:underline"
              >
                ¡Escribe la primera!
              </button>
            </div>
          ) : (
            entries.map(entry => {
              const m = moods.find(mo => mo.key === entry.mood);
              return (
                <div
                  key={entry.id}
                  className="rounded-2xl p-4 shadow-sm relative"
                  style={{ backgroundColor: entry.color || '#FDE68A' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{m?.emoji}</span>
                    <span className="font-black text-gray-700">{m?.label}</span>
                    <span className="text-xs text-gray-500 ml-auto pr-6">{formatDate(entry.date)}</span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-xl font-bold leading-none"
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
