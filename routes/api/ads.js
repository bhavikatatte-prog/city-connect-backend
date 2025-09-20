const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleware');
const db = require('../../config/db');

// @route   POST /api/ads
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, image_url, location, contact, ad_date } = req.body;
    await db.execute(
      'INSERT INTO advertisements (title, description, image_url, location, posted_by, contact, ad_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, image_url, location, req.user.id, contact, ad_date]
    );
    res.status(201).json({ msg: 'Advertisement submitted for review' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/ads/pending
router.get('/pending', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied' });
  }
  try {
    const [ads] = await db.execute(
      `SELECT a.*, u.name as posted_by_name, u.email as posted_by_email
       FROM advertisements a JOIN users u ON a.posted_by = u.id
       WHERE a.status = 'pending'
       ORDER BY a.created_at DESC`
    );
    res.json(ads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/ads/approve/:id
router.put('/approve/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied' });
  }
  try {
    await db.execute(
      'UPDATE advertisements SET status = "approved" WHERE id = ?',
      [req.params.id]
    );
    res.json({ msg: 'Advertisement approved' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/ads
router.get('/', async (req, res) => {
  try {
    const [ads] = await db.execute(
      `SELECT a.*, u.name as posted_by_name, u.address as posted_by_address
       FROM advertisements a JOIN users u ON a.posted_by = u.id
       WHERE a.status = 'approved'
       ORDER BY a.created_at DESC`
    );
    res.json(ads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;