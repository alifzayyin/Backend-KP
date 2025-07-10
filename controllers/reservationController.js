const db = require('../config/db');

   // Mendapatkan semua reservasi
   exports.getReservations = (req, res) => {
     db.query('SELECT * FROM reservations', (err, results) => {
       if (err) return res.status(500).json({ message: err.message });
       res.json(results);
     });
   };

   // Menambahkan reservasi
   exports.addReservation = (req, res) => {
     const { name, email, date, purpose } = req.body;
     db.query(
       'INSERT INTO reservations (name, email, date, purpose) VALUES (?, ?, ?, ?)',
       [name, email, date, purpose],
       (err, result) => {
         if (err) return res.status(400).json({ message: err.message });
         res.status(201).json({ id: result.insertId, name, email, date, purpose });
       }
     );
   };