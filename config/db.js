const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'indigospacesdk',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

pool.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL database pool');
    connection.release();
  })
  .catch((err) => {
    console.error('Error connecting to MySQL Pool:', err);
  });

// Tangani error pool
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Reconnecting to database...');
    // Logika ulang koneksi bisa ditambahkan di sini jika diperlukan
  }
});

module.exports = pool;