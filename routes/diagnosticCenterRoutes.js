import express from 'express';
import {
  createCenter,
  getAllCenters,
  getCenterById,
  updateCenter,
  deleteCenter
} from '../controllers/diagnosticCenterController.js';
import { protect, authorize, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCenters);
router.get('/:id', getCenterById);

// Protected routes
router.use(protect);

// Admin and Super Admin routes
router.post('/', checkPermission('create_centers'), createCenter);
router.put('/:id', checkPermission('update_centers'), updateCenter);
router.delete('/:id', checkPermission('delete_centers'), deleteCenter);

export default router;
