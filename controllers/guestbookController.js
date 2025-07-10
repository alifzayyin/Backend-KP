const db = require('../config/db');

exports.getGuestbookEntries = (req, res) => {
  db.query('SELECT * FROM guestbook', (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
};

exports.addGuestbookEntry = (req, res) => {
  const { name, message } = req.body;
  db.query(
    'INSERT INTO guestbook (name, message) VALUES (?, ?)',
    [name, message],
    (err, result) => {
      if (err) return res.status(400).json({ message: err.message });
      res.status(201).json({ id: result.insertId, name, message, status: 'pending' });
    }
  );
};

exports.updateGuestbookStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.query(
    'UPDATE guestbook SET status = ? WHERE id = ?',
    [status, id],
    (err) => {
      if (err) return res.status(400).json({ message: err.message });
      res.json({ id, status });
    }
  );
};