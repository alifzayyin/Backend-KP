const pool = require('../config/db');

exports.getNews = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM news ORDER BY date DESC');
    if (rows.length === 0) {
      return res.status(200).json({ message: 'No news found', data: [] });
    }
    res.json(rows);
  } catch (err) {
    console.error('Error fetching news:', err.message);
    res.status(500).json({ message: 'Server error while fetching news', error: err.message });
  }
};

exports.addNews = async (req, res) => {
  const { title, content, date } = req.body;
  console.log('Received body for add:', req.body);

  if (!title || !content || !date) {
    return res.status(400).json({ message: 'Title, content, and date are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO news (title, content, date) VALUES (?, ?, ?)',
      [title, content, date]
    );
    res.status(201).json({
      id: result.insertId,
      title,
      content,
      date
    });
  } catch (err) {
    console.error('Error adding news:', err.message);
    res.status(400).json({ message: 'Error adding news', error: err.message });
  }
};

exports.updateNews = async (req, res) => {
  const { id } = req.params;
  const { title, content, date } = req.body;
  console.log('Received params:', { id }, 'Received body for update:', req.body);

  if (!id || !title || !content || !date) {
    return res.status(400).json({ message: 'ID, title, content, and date are required' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE news SET title = ?, content = ?, date = ? WHERE id = ?',
      [title, content, date, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json({
      id,
      title,
      content,
      date
    });
  } catch (err) {
    console.error('Error updating news:', err.message);
    res.status(400).json({ message: 'Error updating news', error: err.message });
  }
};

exports.deleteNews = async (req, res) => {
  const { id } = req.params;
  console.log('Received params for delete:', { id });

  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }

  try {
    const [result] = await pool.query('DELETE FROM news WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json({ message: 'News deleted' });
  } catch (err) {
    console.error('Error deleting news:', err.message);
    res.status(400).json({ message: 'Error deleting news', error: err.message });
  }
};