import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { authenticate } from '../middleware/auth.js';
import { userRepo } from '../models/User.js';
import { settingsRepo } from '../models/Settings.js';

const router = express.Router();
router.use(cookieParser());

const signToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev-secret-change-me',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await userRepo.create({ name, email, password: hash });
    await settingsRepo.upsert(user._id.toString(), { demoMode: true });
    const token = signToken(user);
    setTokenCookie(res, token);
    return res.status(201).json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    throw err;
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await userRepo.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = signToken(user);
    setTokenCookie(res, token);
    return res.json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    throw err;
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const user = await userRepo.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } });
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  return res.json({ ok: true });
});

export default router;
