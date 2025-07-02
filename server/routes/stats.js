import express from 'express';
import { pgClient } from '../config/postgres.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get overall statistics
router.get('/overall', authenticateToken, async (req, res) => {
  try {
    // Get file counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('property_files')
      .select('status')
      .then(({ data, error }) => {
        if (error) throw error;
        
        const counts = data.reduce((acc, file) => {
          acc[file.status] = (acc[file.status] || 0) + 1;
          return acc;
        }, {});
        
        return { data: counts, error: null };
      });

    if (statusError) throw statusError;

    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get total files
    const { count: totalFiles, error: filesError } = await supabase
      .from('property_files')
      .select('*', { count: 'exact', head: true });

    if (filesError) throw filesError;

    res.json({
      total_files: totalFiles || 0,
      total_users: totalUsers || 0,
      pending_files: statusCounts.pending || 0,
      validation_files: statusCounts.validation || 0,
      data_entry_files: statusCounts['data-entry'] || 0,
      verification_files: statusCounts.verification || 0,
      ready_to_print_files: statusCounts['ready-to-print'] || 0,
      completed_files: statusCounts.completed || 0,
      on_hold_files: statusCounts['on-hold'] || 0,
      cancelled_files: statusCounts.cancelled || 0
    });
  } catch (error) {
    console.error('Get overall stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get user dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    let query = supabase.from('property_files').select('status');

    // Filter by user role
    if (req.user.position === 'coordinator') {
      query = query.eq('coordinator_id', req.user.id);
    } else if (req.user.position === 'validator') {
      query = query.eq('validator_id', req.user.id);
    } else if (req.user.position === 'key-in') {
      query = query.eq('key_in_operator_id', req.user.id);
    } else if (req.user.position === 'verification') {
      query = query.eq('verification_officer_id', req.user.id);
    }

    const { data: files, error } = await query;

    if (error) throw error;

    const statusCounts = files.reduce((acc, file) => {
      acc[file.status] = (acc[file.status] || 0) + 1;
      return acc;
    }, {});

    let pendingTasks = 0;
    if (req.user.position === 'validator') {
      pendingTasks = statusCounts.validation || 0;
    } else if (req.user.position === 'key-in') {
      pendingTasks = statusCounts['data-entry'] || 0;
    } else if (req.user.position === 'verification') {
      pendingTasks = statusCounts.verification || 0;
    }

    const totalAssigned = files.length;
    const completedFiles = statusCounts.completed || 0;
    const completionRate = totalAssigned > 0 ? Math.round((completedFiles / totalAssigned) * 100) : 0;

    res.json({
      total_assigned: totalAssigned,
      pending_tasks: pendingTasks,
      recent_activity: 0, // This would need more complex logic
      completion_rate: completionRate,
      status_distribution: statusCounts
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

export default router;