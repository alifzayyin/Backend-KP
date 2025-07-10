const db = require('../config/db');

   // Mendapatkan semua pengumuman
   exports.getAnnouncements = (req, res) => {
     db.query('SELECT * FROM announcements', (err, results) => {
       if (err) return res.status(500).json({ message: err.message });
       res.json(results);
     });
   };

   // Menambahkan pengumuman
   exports.addAnnouncement = (req, res) => {
     const { title, content } = req.body;
     db.query(
       'INSERT INTO announcements (title, content) VALUES (?, ?)',
       [title, content],
       (err, result) => {
         if (err) return res.status(400).json({ message: err.message });
         res.status(201).json({ id: result.insertId, title, content });
       }
     );
   };