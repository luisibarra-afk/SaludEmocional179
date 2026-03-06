const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { read, write } = require('../db');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'mochila_secret_2024';

// Seed demo users on first run
const seedUsers = () => {
  const users = read('users');
  if (users.length === 0) {
    const initial = [
      {
        id: '1', name: 'Admin', email: 'admin@mochila.mx',
        password: bcrypt.hashSync('admin123', 10), role: 'admin',
        avatar: '🔑', achievements: [], streak: 0
      },
      {
        id: '2', name: 'Maestra Rosa', email: 'maestra@mochila.mx',
        password: bcrypt.hashSync('maestra123', 10), role: 'maestro',
        avatar: '👩‍🏫', achievements: [], streak: 0
      },
      {
        id: '3', name: 'Papá García', email: 'papa@mochila.mx',
        password: bcrypt.hashSync('papa123', 10), role: 'padre',
        avatar: '👨‍👦', childId: '4', achievements: [], streak: 0
      },
      {
        id: '4', name: 'Luis García', email: 'alumno@mochila.mx',
        password: bcrypt.hashSync('alumno123', 10), role: 'alumno',
        avatar: '🎒', grade: '3° A', achievements: [], streak: 0
      },
    ];
    write('users', initial);
    console.log('✅ Usuarios demo creados');
  }
};
seedUsers();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = read('users');
  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
  const { password: _, ...userData } = user;
  res.json({ token, user: userData });
});

router.post('/register', (req, res) => {
  const { name, email, password, role = 'alumno', grade } = req.body;
  const users = read('users');
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email ya registrado' });
  }
  const newUser = {
    id: Date.now().toString(),
    name, email,
    password: bcrypt.hashSync(password, 10),
    role,
    avatar: '🎒',
    grade: grade || '1° A',
    achievements: [],
    streak: 0,
  };
  users.push(newUser);
  write('users', users);
  const token = jwt.sign({ id: newUser.id, role: newUser.role }, SECRET, { expiresIn: '7d' });
  const { password: _, ...userData } = newUser;
  res.json({ token, user: userData });
});

module.exports = router;
