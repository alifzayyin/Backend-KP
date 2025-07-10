const pool = require('../config/db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Konfigurasi multer untuk menyimpan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
  },
});

const upload = multer({ storage: storage });

// Middleware untuk unggahan tunggal
exports.upload = upload.single('image_url');

exports.getBeranda = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM beranda LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Beranda content not found' });
    }
    res.json({ id: rows[0].id, content: rows[0].content, image_url: rows[0].image_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBeranda = async (req, res) => {
  const { content } = req.body;
  const image_url = req.file ? req.file.path : null; // Gunakan path file jika ada, atau null

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE beranda SET content = ?, image_url = ? WHERE id = 1',
      [content, image_url]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Beranda content not found' });
    }
    res.json({ message: 'Beranda updated successfully', content, image_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};