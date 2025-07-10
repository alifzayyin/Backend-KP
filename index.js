const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin.includes('localhost') || origin.startsWith('http://192.168.')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Koneksi ke database pool
const pool = require('./config/db');

// Fungsi untuk inisialisasi akun admin
const bcrypt = require('bcryptjs');
const initAdmin = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10); // Hash password
      await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@indigospace.com', hashedPassword, 'admin']
      );
      console.log('Admin account initialized with username: admin, password: admin123');
    } else {
      console.log('Admin account already exists');
    }
  } catch (err) {
    console.error('Error initializing admin:', err.message);
  }
};

// Jalankan inisialisasi admin saat server mulai
initAdmin();

// Rute
const userRoutes = require('./routes/userRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const guestbookRoutes = require('./routes/guestbookRoutes');
const roomRoutes = require('./routes/roomRoutes');
const communityRoutes = require('./routes/communityRoutes');
const newsRoutes = require('./routes/newsRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const berandaRoutes = require('./routes/berandaRoutes');

app.use('/api', userRoutes);
app.use('/api', announcementRoutes);
app.use('/api', reservationRoutes);
app.use('/api', guestbookRoutes);
app.use('/api', roomRoutes);
app.use('/api', communityRoutes);
app.use('/api', newsRoutes);
app.use('/api', galleryRoutes);
app.use('/api', berandaRoutes);

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});