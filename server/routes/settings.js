import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { settingsRepo } from '../models/Settings.js';

const router = express.Router();

// GET /api/settings  - sensitive values masked
router.get('/', authenticate, async (req, res) => {
  const publicSettings = await settingsRepo.getPublic(req.user.id);
  return res.json({ settings: publicSettings || { demoMode: true } });
});

// PUT /api/settings
router.put('/', authenticate, async (req, res) => {
  const allowed = [
    'geminiApiKey',
    'whatsAppAccessToken',
    'phoneNumberId',
    'whatsAppBusinessAccountId',
    'webhookVerifyToken',
    'aiLanguage',
    'aiPersonality',
    'notifyNewMessage',
    'notifyNewEnquiry',
    'notifyUnanswered',
    'soundEnabled',
    'demoMode',
  ];
  const data = {};
  for (const key of allowed) {
    if (key in (req.body || {})) data[key] = req.body[key];
  }
  const settings = await settingsRepo.upsert(req.user.id, data);
  return res.json({ settings });
});

export default router;
