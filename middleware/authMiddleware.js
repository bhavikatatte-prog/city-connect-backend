const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await db.execute('SELECT id, role FROM users WHERE id = ?', [decoded.user.id]);
    if (rows.length === 0) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};