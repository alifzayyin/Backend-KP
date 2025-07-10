const pool = require('../config/db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse');

// Konfigurasi multer (opsional untuk gambar nanti)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
exports.upload = upload.single('image_url');

// Impor komunitas dari CSV
exports.importCommunities = async (req, res) => {
  const filePath = 'D:\\backend\\communities.csv';
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ message: 'CSV file not found' });
  }

  try {
    const records = [];
    fs.createReadStream(filePath)
      .pipe(csv.parse({ columns: true, trim: true }))
      .on('data', (row) => records.push(row))
      .on('end', async () => {
        for (const row of records) {
          const { nama_komunitas, koordinator = '', telepon = '', email_komunitas = '', jumlah_anggota = 0 } = row;
          if (nama_komunitas) {
            await pool.query(
              'INSERT IGNORE INTO community (nama_komunitas, koordinator, telepon, email_komunitas, jumlah_anggota) VALUES (?, ?, ?, ?, ?)',
              [nama_komunitas, koordinator, telepon, email_komunitas, jumlah_anggota]
            );
          }
        }
        res.json({ message: 'Communities imported successfully', count: records.length });
      })
      .on('error', (err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCommunities = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM community');
    console.log('Communities fetched from DB:', rows);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching communities:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.addCommunity = async (req, res) => {
  const { nama_komunitas, koordinator, telepon, email_komunitas, jumlah_anggota } = req.body;
  try {
    if (!nama_komunitas || !koordinator || !telepon || !email_komunitas || !jumlah_anggota) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO community (nama_komunitas, koordinator, telepon, email_komunitas, jumlah_anggota) VALUES (?, ?, ?, ?, ?)',
      [nama_komunitas, koordinator, telepon, email_komunitas, jumlah_anggota]
    );
    res.status(201).json({
      id: result.insertId,
      nama_komunitas,
      koordinator,
      telepon,
      email_komunitas,
      jumlah_anggota,
    });
  } catch (err) {
    console.error('Error adding community:', err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.updateCommunity = async (req, res) => {
  const { id } = req.params;
  const { nama_komunitas, koordinator, telepon, email_komunitas, jumlah_anggota } = req.body;
  try {
    if (!nama_komunitas || !koordinator || !telepon || !email_komunitas || !jumlah_anggota) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const [result] = await pool.query(
      'UPDATE community SET nama_komunitas = ?, koordinator = ?, telepon = ?, email_komunitas = ?, jumlah_anggota = ? WHERE id = ?',
      [nama_komunitas, koordinator, telepon, email_komunitas, jumlah_anggota, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json({ id, nama_komunitas, koordinator, telepon, email_komunitas, jumlah_anggota });
  } catch (err) {
    console.error('Error updating community:', err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCommunity = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM community WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Community not found' });
    }
    await pool.query('DELETE FROM community_users WHERE community_id = ?', [id]);
    res.json({ message: 'Community deleted' });
  } catch (err) {
    console.error('Error deleting community:', err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.registerToCommunity = async (req, res) => {
  const userId = req.user.id;
  const { communityId } = req.body;

  if (!communityId) {
    return res.status(400).json({ message: 'Community ID is required' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT * FROM community_users WHERE user_id = ? AND community_id = ?',
      [userId, communityId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already registered to this community' });
    }

    await pool.query(
      'INSERT INTO community_users (user_id, community_id) VALUES (?, ?)',
      [userId, communityId]
    );
    res.json({ message: 'Successfully registered to community', communityId });
  } catch (err) {
    console.error('Error registering to community:', err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.getUserCommunities = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.query(
      'SELECT c.* FROM community c JOIN community_users cu ON c.id = cu.community_id WHERE cu.user_id = ?',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching user communities:', err.message);
    res.status(500).json({ message: err.message });
  }
};