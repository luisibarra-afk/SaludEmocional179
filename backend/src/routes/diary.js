const express = require('express');
const auth = require('../middleware/auth');
const { read, write } = require('../db');

const router = express.Router();

// Get own diary entries
router.get('/', auth, (req, res) => {
  const entries = read('diary').filter(e => e.userId === req.user.id);
  res.json(entries.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// Create entry
router.post('/', auth, (req, res) => {
  const { mood, text, color } = req.body;
  const entries = read('diary');
  const entry = {
    id: Date.now().toString(),
    userId: req.user.id,
    mood,
    text,
    color,
    date: new Date().toISOString(),
  };
  entries.push(entry);
  write('diary', entries);

  // Update streak and unlock achievements
  const users = read('users');
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx !== -1) {
    users[idx].streak = (users[idx].streak || 0) + 1;
    const streak = users[idx].streak;
    const achievements = users[idx].achievements || [];

    if (streak >= 1 && !achievements.includes('primer_entrada')) {
      achievements.push('primer_entrada');
    }
    if (streak >= 7 && !achievements.includes('semana_constante')) {
      achievements.push('semana_constante');
    }
    // Check mood variety
    const userEntries = entries.filter(e => e.userId === req.user.id);
    const moods = new Set(userEntries.map(e => e.mood));
    if (moods.size >= 5 && !achievements.includes('experto_emocional')) {
      achievements.push('experto_emocional');
    }
    if (userEntries.length >= 30 && !achievements.includes('escritor')) {
      achievements.push('escritor');
    }
    users[idx].achievements = achievements;
    write('users', users);
  }

  res.json({ ...entry, newAchievements: [] });
});

// Delete own entry
router.delete('/:id', auth, (req, res) => {
  const entries = read('diary').filter(
    e => !(e.id === req.params.id && e.userId === req.user.id)
  );
  write('diary', entries);
  res.json({ ok: true });
});

// Mood summary for teachers/parents (no text content)
router.get('/summary/:studentId', auth, (req, res) => {
  if (!['maestro', 'padre', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Sin permiso' });
  }
  const entries = read('diary')
    .filter(e => e.userId === req.params.studentId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const summary = entries.map(e => ({ mood: e.mood, date: e.date, color: e.color }));
  res.json(summary);
});

module.exports = router;
