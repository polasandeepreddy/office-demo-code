import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pgClient } from '../config/postgres.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Debug: Confirm route loaded
console.log('✅ auth.js loaded');

// Test route
router.get('/ping', (req, res) => {
  res.json({ message: 'Auth route is working ✅' });
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Get user from DB
    const result = await pgClient.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true LIMIT 1',
      [normalizedEmail]
    );

    const user = result.rows[0];

    // Check if user exists and has password_hash
    if (!user || !user.password_hash) {
      console.log('❌ No user or missing password_hash');
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      console.log('❌ Incorrect password');
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Log client info
    const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Update user last login
    await pgClient.query(
      'UPDATE users SET last_login_ip = $1, updated_at = $2 WHERE id = $3',
      [clientIP, new Date().toISOString(), user.id]
    );

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        position: user.position,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '24h' }
    );

    // Insert audit log
    await pgClient.query(
      `INSERT INTO audit_logs
        (user_id, action_type, model_name, object_id, object_repr, ip_address, user_agent)
       VALUES ($1, 'login', 'User', $2, $3, $4, $5)`,
      [user.id, user.id, user.full_name, clientIP, userAgent]
    );

    // Remove password_hash from user object before sending
    const { password_hash, ...userResponse } = user;

    // Success response
    res.status(200).json({
      access_token: token,
      user: userResponse,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ✅ Logout route
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || 'unknown';

    await pgClient.query(
      `INSERT INTO audit_logs
        (user_id, action_type, model_name, object_id, object_repr, ip_address, user_agent)
       VALUES ($1, 'logout', 'User', $2, $3, $4, $5)`,
      [req.user.id, req.user.id, req.user.full_name, clientIP, userAgent]
    );

    res.json({ message: 'Successfully logged out.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ✅ Current user info
router.get('/me', authenticateToken, (req, res) => {
  try {
    const { password_hash, ...userResponse } = req.user;
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Get /me error:', error);
    res.status(500).json({ error: 'Unable to fetch user.' });
  }
});

export default router;
