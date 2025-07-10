const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'user']
    );

    res.status(201).json({ message: 'User registered successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt - Received:', { username, password }); // Debug input
  try {
    const [results] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    console.log('Query result:', results); // Debug query result
    if (results.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    console.log('Password match:', isMatch); // Debug password match
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = (req, res) => {
  res.json(req.user);
};