const express = require('express');
const router = express.Router();

const tips = {
  feliz: [
    '¡Qué bueno que te sientes bien! Comparte esa alegría con alguien hoy.',
    'La felicidad crece cuando la compartimos. ¿A quién puedes hacerle sonreír?',
    'Aprovecha esta energía positiva para hacer algo que disfrutes mucho.',
  ],
  triste: [
    'Está bien sentirse triste. Tus emociones son válidas. Respira profundo.',
    'Hablar con alguien de confianza puede ayudarte a sentirte mejor.',
    'Date un momento para ti. Puedes escuchar música, dibujar o salir a caminar.',
    'La tristeza pasa, como las nubes. Eres más fuerte de lo que crees.',
  ],
  enojado: [
    'Cuando sientas enojo, respira 5 veces profundo antes de reaccionar.',
    'El enojo nos avisa que algo nos molestó. ¿Qué pasó? Escribirlo ayuda.',
    'Prueba el ejercicio de respiración en tu mochila para calmarte.',
    'Contar hasta 10 lentamente da tiempo para que la mente se calme.',
  ],
  ansioso: [
    'La ansiedad es normal. Intenta el ejercicio de respiración 4-7-8.',
    'Enfócate en lo que puedes controlar ahora mismo, un paso a la vez.',
    'Si sientes mucha presión, habla con tu maestra o con tus papás.',
    'Cierra los ojos y nombra 5 cosas que puedes tocar a tu alrededor.',
  ],
  cansado: [
    'Tu cuerpo te pide descanso. ¿Dormiste bien anoche?',
    'Un pequeño descanso de 10 minutos puede hacer gran diferencia.',
    'Hidratarte y moverte un poco ayuda cuando te sientes cansado.',
    'A veces el cansancio es señal de que necesitamos hacer una pausa.',
  ],
  nervioso: [
    'Sentir nervios antes de algo importante es completamente normal.',
    'Recuerda: ya has superado cosas difíciles antes. ¡Tú puedes!',
    'Intenta el juego de respiración para calmar los nervios.',
    'Habla contigo mismo con amabilidad: "Puedo hacerlo, estoy preparado".',
  ],
};

router.get('/:mood', (req, res) => {
  const moodTips = tips[req.params.mood] || tips.feliz;
  const tip = moodTips[Math.floor(Math.random() * moodTips.length)];
  res.json({ tip });
});

module.exports = router;
