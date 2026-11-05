import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { knowledgeRepo } from '../models/KnowledgeBase.js';

const router = express.Router();

// GET /api/knowledge
router.get('/', authenticate, async (req, res) => {
  const kb = await knowledgeRepo.findByUser(req.user.id);
  return res.json({ knowledge: kb || null });
});

// PUT /api/knowledge
router.put('/', authenticate, async (req, res) => {
  const data = req.body || {};
  const kb = await knowledgeRepo.upsert(req.user.id, data);
  return res.json({ knowledge: kb });
});

export default router;
