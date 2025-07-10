const db = require('../config/db');

exports.getGuestbookEntries = (req, res) => {
  db.query('SELECT * FROM guestbook ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
};

exports.addGuestbookEntry = (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  const { nama, asal_instansi, keperluan, waktu } = req.body;

  if (!nama || !asal_instansi || !keperluan || !waktu) {
    return res.status(400).json({ message: 'All fields (nama, asal_instansi, keperluan, waktu) are required' });
  }

  const waktuDate = new Date(waktu);
  if (isNaN(waktuDate.getTime())) {
    return res.status(400).json({ message: 'Invalid waktu format, use YYYY-MM-DD HH:MM:SS' });
  }

  db.query(
    'INSERT INTO guestbook (user_id, nama, asal_instansi, keperluan, waktu, status) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, nama, asal_instansi, keperluan, waktu, 'pending'],
    (err, result) => {
      if (err) return res.status(400).json({ message: err.message });
      res.status(201).json({
        id: result.insertId,
        user_id: userId,
        nama,
        asal_instansi,
        keperluan,
        waktu,
        status: 'pending'
      });
    }
  );
};

exports.updateGuestbookEntry = (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  const { nama, asal_instansi, keperluan, waktu } = req.body;

  if (!nama || !asal_instansi || !keperluan || !waktu) {
    return res.status(400).json({ message: 'All fields (nama, asal_instansi, keperluan, waktu) are required' });
  }

  const waktuDate = new Date(waktu);
  if (isNaN(waktuDate.getTime())) {
    return res.status(400).json({ message: 'Invalid waktu format, use YYYY-MM-DD HH:MM:SS' });
  }

  db.query(
    'SELECT * FROM guestbook WHERE id = ? AND user_id = ?',
    [id, userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(403).json({ message: 'Unauthorized to edit this entry' });
      }
      if (results[0].status !== 'pending') {
        return res.status(403).json({ message: 'Cannot edit confirmed entry' });
      }

      db.query(
        'UPDATE guestbook SET nama = ?, asal_instansi = ?, keperluan = ?, waktu = ?, updated_at = NOW() WHERE id = ?',
        [nama, asal_instansi, keperluan, waktu, id],
        (err) => {
          if (err) return res.status(400).json({ message: err.message });
          res.json({ id, user_id: userId, nama, asal_instansi, keperluan, waktu, status: 'pending' });
        }
      );
    }
  );
};

exports.deleteGuestbookEntry = (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  db.query(
    'SELECT * FROM guestbook WHERE id = ? AND user_id = ?',
    [id, userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(403).json({ message: 'Unauthorized to delete this entry' });
      }
      if (results[0].status !== 'pending') {
        return res.status(403).json({ message: 'Cannot delete confirmed entry' });
      }

      db.query('DELETE FROM guestbook WHERE id = ?', [id], (err) => {
        if (err) return res.status(400).json({ message: err.message });
        res.json({ message: 'Guestbook entry deleted' });
      });
    }
  );
};

exports.updateGuestbookStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || status !== 'confirmed') { // Hanya izinkan 'confirmed'
    return res.status(400).json({ message: 'Status must be confirmed' });
  }

  db.query(
    'UPDATE guestbook SET status = ? WHERE id = ?',
    [status, id],
    (err, result) => {
      if (err) return res.status(400).json({ message: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Guestbook entry not found' });
      }
      res.json({ message: 'Guestbook entry confirmed', id });
    }
  );
};