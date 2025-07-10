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
    cb(null, Date.now() + '-' + file.originalname); // Nama file unik
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran file 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware untuk unggahan tunggal
exports.upload = upload.single('image');

exports.getGallery = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addGalleryItem = async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);

  const { title, description } = req.body;
  const image_url = req.file ? req.file.path : null;

  if (!title || !description || !image_url) {
    return res.status(400).json({ message: 'Title, description, and image are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO gallery (title, description, image_url, created_at) VALUES (?, ?, ?, NOW())',
      [title, description, image_url]
    );
    res.status(201).json({ id: result.insertId, title, description, image_url });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); // Hapus file jika gagal
    }
    res.status(400).json({ message: err.message });
  }
};

exports.updateGalleryItem = async (req, res) => {
  const { id } = req.params;
  const { title, description, image_url } = req.body;
  try {
    await pool.query(
      'UPDATE gallery SET title = ?, description = ?, image_url = ?, updated_at = NOW() WHERE id = ?',
      [title, description, image_url, id]
    );
    res.json({ id, title, description, image_url });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT image_url FROM gallery WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    const imageUrl = rows[0].image_url;
    if (imageUrl && fs.existsSync(imageUrl)) {
      fs.unlinkSync(imageUrl);
    }

    await pool.query('DELETE FROM gallery WHERE id = ?', [id]);
    res.json({ message: 'Gallery item deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};