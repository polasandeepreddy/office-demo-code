import express from 'express';
import { pgClient } from '../config/postgres.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, page_size = 50 } = req.query;
    const offset = (page - 1) * page_size;

    const notificationsQuery = `
      SELECT 
        n.*,
        s.full_name AS sender_full_name,
        pf.file_id AS property_file_id
      FROM notifications n
      LEFT JOIN users s ON s.id = n.sender_id
      LEFT JOIN property_files pf ON pf.id = n.property_file_id
      WHERE n.recipient_id = $1 OR n.recipient_id IS NULL
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) FROM notifications 
      WHERE recipient_id = $1 OR recipient_id IS NULL
    `;

    const { rows: notifications } = await pgClient.query(notificationsQuery, [req.user.id, page_size, offset]);
    const { rows: countResult } = await pgClient.query(countQuery, [req.user.id]);
    const count = parseInt(countResult[0].count, 10);

    res.json({
      results: notifications,
      count,
      page: parseInt(page),
      page_size: parseInt(page_size)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE id = $1 AND recipient_id = $2
      RETURNING *
    `;
    const { rowCount } = await pgClient.query(query, [id, req.user.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Notification not found or access denied' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      DELETE FROM notifications
      WHERE id = $1 AND recipient_id = $2
    `;
    const { rowCount } = await pgClient.query(query, [id, req.user.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Notification not found or access denied' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
