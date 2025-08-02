import express from 'express';
import { getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes here are prefixed with /api/users
router.get('/profile', protect, getUserProfile);

export default router;