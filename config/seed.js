const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('./db');

const filePath = path.join(__dirname, 'communities.csv');

let total = 0;
let done = 0;

fs.createReadStream(filePath)
  .pipe(csv({ separator: ';' }))  // <= penting: karena CSV pakai titik koma
  .on('data', (row) => {
    total++;

    const id = parseInt(row['Id Komunitas']);
    const nama_komunitas = row['Nama Komunitas'] || null;
    const tipe = row['Tipe'] !== '-' ? row['Tipe'] : null;
    const koordinator = row['Koordinator'] || null;
    const telepon = row['Telepon'] !== '-' ? row['Telepon'] : null;
    const email_komunitas = row['Email Komunitas'] || null;
    const jumlah_anggota = row['Jumlah Anggota'] && row['Jumlah Anggota'] !== '-' ? parseInt(row['Jumlah Anggota']) : null;

    db.query(
      'INSERT INTO community (id, nama_komunitas, tipe, koordinator, telepon, email_komunitas, jumlah_anggota) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, nama_komunitas, tipe, koordinator, telepon, email_komunitas, jumlah_anggota],
      (err) => {
        done++;
        if (err) {
          console.error(`❌ Gagal insert ID ${id}:`, err.message);
        } else {
          console.log(`✅ Berhasil insert: ${nama_komunitas}`);
        }

        if (done === total) {
          db.end();
          console.log('🌟 Semua data selesai di-import.');
        }
      }
    );
  })
  .on('end', () => {
    if (total === 0) {
      console.log('❗ CSV kosong atau tidak terbaca');
      db.end();
    }
  });
