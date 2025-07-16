import express from 'express';
import {
  createTest,
  getTestsByCenter,
  getAllTests,
  updateTest,
  deleteTest
} from '../controllers/diagnosticTestController.js';
import { protect, authorize, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllTests);
router.get('/center/:centerId', getTestsByCenter);

// Protected routes
router.use(protect);

// Admin and center admin routes
router.post('/', checkPermission('create_tests'), createTest);
router.put('/:id', checkPermission('update_tests'), updateTest);
router.delete('/:id', checkPermission('delete_tests'), deleteTest);

export default router;
