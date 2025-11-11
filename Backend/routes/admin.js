const express = require('express');
const db = require('../db');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

const router = express.Router();

// All routes in this file are protected by the admin middleware
router.use(adminAuthMiddleware);

// Feature 1: View registered users
router.get('/users', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, first_name, last_name, email, is_admin, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Feature 2: Edit or delete user credentials
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, isAdmin } = req.body;
  // Note: Password changes should have a separate, dedicated route and logic.
  try {
    const { rows } = await db.query(
      'UPDATE users SET first_name = $1, last_name = $2, email = $3, is_admin = $4 WHERE id = $5 RETURNING id, first_name, last_name, email, is_admin',
      [firstName, lastName, email, isAdmin, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleteOp = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Feature 3 & 5: View all documents (Upload History)
router.get('/documents', async (req, res) => {
   try {
    const { rows } = await db.query(
      `SELECT d.id, d.title, d.filename, d.created_at, d.ai_authors, d.ai_date_created, u.email as uploader_email
       FROM documents d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Feature 3: Edit/Delete any document (Admin-level)
// (Note: These are placeholders and are very similar to the user-level routes, but without the user_id check)
router.put('/documents/:id', async (req, res) => {
    // Placeholder: Add logic to update any document by ID
    res.json({ message: `Admin: Edit document ${req.params.id}` });
});

router.delete('/documents/:id', async (req, res) => {
    // Placeholder: Add logic to delete any document by ID (don't forget fs.unlink)
     res.json({ message: `Admin: Delete document ${req.params.id}` });
});


module.exports = router;