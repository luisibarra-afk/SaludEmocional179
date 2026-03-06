const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/diary', require('./routes/diary'));
app.use('/api/tips', require('./routes/tips'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🎒 Servidor Mochila corriendo en http://localhost:${PORT}`));
