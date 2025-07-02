import jwt from 'jsonwebtoken';
import { pgClient } from '../config/postgres.js';

// Middleware: Authenticate token and attach user to request
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your_fallback_jwt_secret';
    const decoded = jwt.verify(token, secret);

    const result = await pgClient.query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // 🛡️ Strip sensitive data (like hashed password)
    const { password, ...safeUser } = user;
    req.user = safeUser;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware factory: Restrict access to specific roles
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.position)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware: Admin-only access
export const requireAdmin = requireRole(['admin']);
