const express = require('express');
const auth = require('../middleware/auth');
const { read, write } = require('../db');

const router = express.Router();

router.get('/me', auth, (req, res) => {
  const user = read('users').find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { password, ...data } = user;
  res.json(data);
});

router.get('/students', auth, (req, res) => {
  if (!['maestro', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Sin permiso' });
  }
  const students = read('users')
    .filter(u => u.role === 'alumno')
    .map(({ password, ...u }) => u);
  res.json(students);
});

router.patch('/avatar', auth, (req, res) => {
  const { avatar } = req.body;
  const users = read('users');
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  users[idx].avatar = avatar;
  write('users', users);
  res.json({ avatar });
});

module.exports = router;
