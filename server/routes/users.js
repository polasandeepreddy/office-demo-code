import express from 'express';
import bcrypt from 'bcrypt';
import { pgClient } from '../config/postgres.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, page_size = 25, position, search } = req.query;
    const offset = (page - 1) * page_size;

    let baseQuery = `SELECT id, full_name, email, mobile_number, position, is_active, department, employee_id, created_at, updated_at FROM users`;
    let conditions = [];
    let values = [];

    if (position) {
      values.push(position);
      conditions.push(`position = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      values.push(`%${search}%`);
      values.push(`%${search}%`);
      conditions.push(`(full_name ILIKE $${values.length - 2} OR email ILIKE $${values.length - 1} OR employee_id ILIKE $${values.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `${baseQuery} ${whereClause} ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(page_size);
    values.push(offset);

    const result = await pgClient.query(query, values);
    const countResult = await pgClient.query(`SELECT COUNT(*) FROM users ${whereClause}`, values.slice(0, values.length - 2));

    res.json({
      results: result.rows,
      count: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      page_size: parseInt(page_size),
      total_pages: Math.ceil(countResult.rows[0].count / page_size)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get users by position
router.get('/position/:position', authenticateToken, async (req, res) => {
  try {
    const { position } = req.params;

    const result = await pgClient.query(
      `SELECT id, full_name, email, mobile_number, position, is_active
       FROM users
       WHERE position = $1 AND is_active = true
       ORDER BY full_name`,
      [position]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get users by position error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { full_name, email, mobile_number, position, department, employee_id } = req.body;

    if (!full_name || !email || !mobile_number || !position) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const password_hash = await bcrypt.hash('admin123', 10);

    const insertQuery = `
      INSERT INTO users (full_name, email, mobile_number, position, department, employee_id, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [
      full_name,
      email.toLowerCase(),
      mobile_number,
      position,
      department,
      employee_id,
      password_hash
    ];

    const { rows } = await pgClient.query(insertQuery, values);
    const data = rows[0];

    const auditQuery = `
      INSERT INTO audit_logs (user_id, action_type, model_name, object_id, object_repr, changes, ip_address, user_agent)
      VALUES ($1, 'create', 'User', $2, $3, $4, $5, $6)
    `;
    await pgClient.query(auditQuery, [
      req.user.id,
      data.id,
      data.full_name,
      JSON.stringify({ created: req.body }),
      req.ip,
      req.headers['user-agent']
    ]);

    delete data.password_hash;
    res.status(201).json(data);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email or employee ID already exists' });
    }
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.user.position !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    delete updates.password_hash;
    delete updates.id;
    delete updates.created_at;

    updates.updated_at = new Date().toISOString();

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const updateQuery = `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

    const result = await pgClient.query(updateQuery, [...values, id]);
    const data = result.rows[0];

    await pgClient.query(
      `INSERT INTO audit_logs (user_id, action_type, model_name, object_id, object_repr, changes, ip_address, user_agent)
       VALUES ($1, 'update', 'User', $2, $3, $4, $5, $6)`,
      [
        req.user.id,
        id,
        data.full_name,
        JSON.stringify({ updated: updates }),
        req.ip,
        req.headers['user-agent']
      ]
    );

    delete data.password_hash;
    res.json(data);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pgClient.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id]);
    const data = result.rows[0];

    await pgClient.query(
      `INSERT INTO audit_logs (user_id, action_type, model_name, object_id, object_repr, ip_address, user_agent)
       VALUES ($1, 'delete', 'User', $2, $3, $4, $5)`,
      [req.user.id, id, data.full_name, req.ip, req.headers['user-agent']]
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
