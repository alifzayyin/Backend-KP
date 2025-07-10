const pool = require('../config/db');

exports.getRooms = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addRoom = async (req, res) => {
  const { name, capacity, facilities, image_url, status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO rooms (name, capacity, facilities, image_url, status) VALUES (?, ?, ?, ?, ?)',
      [name, capacity, facilities, image_url, status || 'available']
    );
    res.status(201).json({ id: result.insertId, name, capacity, facilities, image_url, status });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  const { id } = req.params;
  const { name, capacity, facilities, image_url, status } = req.body;
  try {
    await pool.query(
      'UPDATE rooms SET name = ?, capacity = ?, facilities = ?, image_url = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [name, capacity, facilities, image_url, status, id]
    );
    res.json({ id, name, capacity, facilities, image_url, status });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};