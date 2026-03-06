import { useRef, useState, useEffect } from 'react';

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#f97316'];

export default function DoodleGame({ onBack }) {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#6366f1');
  const drawing = useRef(false);
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fefce8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    };
    resize();
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    drawing.current = false;
    lastPos.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-orange-50 flex flex-col select-none">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-white/70 backdrop-blur-sm shadow-sm">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800 text-2xl font-bold">‹</button>
        <h2 className="font-black text-gray-700 text-lg">Garabato Libre 🎨</h2>
        <button
          onClick={clear}
          className="text-sm bg-gray-100 hover:bg-gray-200 active:bg-gray-300 font-bold px-3 py-1.5 rounded-full text-gray-600 transition-colors"
        >
          Borrar
        </button>
      </div>

      <p className="text-center text-gray-500 text-sm font-semibold py-2 px-4">
        Dibuja lo que sientes. No hay reglas ni errores aquí 🌈
      </p>

      {/* Color palette */}
      <div className="flex justify-center gap-2 px-4 pb-2">
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="rounded-full transition-all active:scale-90"
            style={{
              width: 32,
              height: 32,
              backgroundColor: c,
              border: color === c ? '4px solid #1e293b' : '3px solid transparent',
              transform: color === c ? 'scale(1.25)' : 'scale(1)',
              boxShadow: color === c ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 px-4 pb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-2xl shadow-lg border-2 border-yellow-200 touch-none"
          style={{ minHeight: 320, cursor: 'crosshair' }}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
      </div>
    </div>
  );
}
