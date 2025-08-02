import express from 'express';
import { getProfile } from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/users/profile
router.get('/profile', protectRoute, getProfile);

export default router;
