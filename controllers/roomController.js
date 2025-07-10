const pool = require('../config/db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Konfigurasi multer untuk menyimpan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

exports.upload = upload.single('image_url');

exports.getRooms = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addRoom = async (req, res) => {
  const { name, capacity, facilities, status } = req.body;
  const image_url = req.file ? req.file.path : null;

  if (!name || !capacity || !facilities || !image_url) {
    return res.status(400).json({ message: 'Name, capacity, facilities, and image are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO rooms (name, capacity, facilities, image_url, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, capacity, facilities, image_url, status || 'available']
    );
    res.status(201).json({ id: result.insertId, name, capacity, facilities, image_url, status });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  const { id } = req.params;
  const { name, capacity, facilities, status } = req.body;
  let image_url = req.body.image_url;

  if (req.file) {
    image_url = req.file.path;
    const [rows] = await pool.query('SELECT image_url FROM rooms WHERE id = ?', [id]);
    if (rows.length > 0 && rows[0].image_url && fs.existsSync(rows[0].image_url)) {
      fs.unlinkSync(rows[0].image_url);
    }
  }

  if (!name || !capacity || !facilities || !image_url) {
    return res.status(400).json({ message: 'Name, capacity, facilities, and image are required' });
  }

  try {
    await pool.query(
      'UPDATE rooms SET name = ?, capacity = ?, facilities = ?, image_url = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [name, capacity, facilities, image_url, status, id]
    );
    res.json({ id, name, capacity, facilities, image_url, status });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT image_url FROM rooms WHERE id = ?', [id]);
    if (rows.length > 0 && rows[0].image_url && fs.existsSync(rows[0].image_url)) {
      fs.unlinkSync(rows[0].image_url);
    }
    await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.reserveRoom = async (req, res) => {
  const { room_id, start_time, end_time } = req.body;
  const user_id = req.user.id; // Ambil dari token JWT via middleware auth

  if (!room_id || !start_time || !end_time) {
    return res.status(400).json({ message: 'Room ID, start time, and end time are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO reservations (room_id, user_id, start_time, end_time, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [room_id, user_id, start_time, end_time, 'pending']
    );
    res.status(201).json({ id: result.insertId, room_id, user_id, start_time, end_time, status: 'pending' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};