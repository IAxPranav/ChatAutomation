// ============================================
// DreamHome Real Estate Chatbot - Server
// ============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ────────────────────────────────────
const chatRoutes      = require('./routes/chat');
const propertyRoutes  = require('./routes/properties');

app.use('/api/chat',       chatRoutes);
app.use('/api/properties', propertyRoutes);

// ── Page routes ───────────────────────────────
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);
app.get('/admin', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'admin.html'))
);

// ── 404 fallback ──────────────────────────────
app.use((req, res) =>
  res.status(404).json({ error: 'Route not found' })
);

// ── Start ─────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🏠 DreamHome Chatbot Server`);
  console.log(`   ➜  http://localhost:${PORT}       (Chat UI)`);
  console.log(`   ➜  http://localhost:${PORT}/admin  (Admin Panel)\n`);
});
