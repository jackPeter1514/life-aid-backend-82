import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllAppointments,
  updateSystemSettings,
  getSystemLogs
} from '../controllers/adminController.js';
import { protect, authorize, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Dashboard and management routes
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:userId/status', checkPermission('update_users'), updateUserStatus);
router.get('/appointments', getAllAppointments);

// Super Admin only routes
router.put('/system/settings', authorize('super_admin'), updateSystemSettings);
router.get('/system/logs', authorize('super_admin'), getSystemLogs);

export default router;
