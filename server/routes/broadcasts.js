import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { broadcastRepo } from '../models/Broadcast.js';
import { conversationRepo } from '../models/Conversation.js';

const router = express.Router();

// GET /api/broadcasts
router.get('/', authenticate, async (req, res) => {
  const broadcasts = await broadcastRepo.findByUser(req.user.id);
  return res.json({
    broadcasts: broadcasts.map((b) => ({
      id: b._id.toString(),
      name: b.name,
      message: b.message,
      status: b.status,
      recipientCount: b.recipientCount,
      sentCount: b.sentCount,
      deliveredCount: b.deliveredCount,
      readCount: b.readCount,
      scheduledAt: b.scheduledAt,
      startedAt: b.startedAt,
      completedAt: b.completedAt,
      filter: b.filter,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    })),
  });
});

// POST /api/broadcasts
router.post('/', authenticate, async (req, res) => {
  const { name, message, status, scheduledAt, filter } = req.body || {};
  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }
  const broadcast = await broadcastRepo.create({
    userId: req.user.id,
    name,
    message,
    status: status || 'draft',
    recipientCount: 0,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    scheduledAt: scheduledAt || null,
    filter: filter || {},
  });
  return res.status(201).json({ broadcast: { id: broadcast._id.toString(), ...broadcast.toObject ? broadcast.toObject() : broadcast } });
});

// PUT /api/broadcasts/:id
router.put('/:id', authenticate, async (req, res) => {
  const b = await broadcastRepo.findById(req.params.id);
  if (!b) return res.status(404).json({ error: 'Broadcast not found' });
  if (b.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const allowed = ['name', 'message', 'status', 'scheduledAt', 'filter', 'recipientCount', 'sentCount', 'deliveredCount', 'readCount'];
  const update = {};
  for (const key of allowed) {
    if (key in (req.body || {})) update[key] = req.body[key];
  }
  const updated = await broadcastRepo.updateById(req.params.id, update);
  return res.json({ broadcast: { id: updated._id.toString(), ...update } });
});

// DELETE /api/broadcasts/:id
router.delete('/:id', authenticate, async (req, res) => {
  const b = await broadcastRepo.findById(req.params.id);
  if (!b) return res.status(404).json({ error: 'Broadcast not found' });
  if (b.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await broadcastRepo.deleteById(req.params.id);
  return res.json({ ok: true });
});

// POST /api/broadcasts/:id/send - simulate sending
router.post('/:id/send', authenticate, async (req, res) => {
  const b = await broadcastRepo.findById(req.params.id);
  if (!b) return res.status(404).json({ error: 'Broadcast not found' });
  if (b.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  // Count eligible recipients
  const filter = b.filter || {};
  const query = { userId: req.user.id, status: 'active' };
  if (filter.leadStatus) query.leadStatus = filter.leadStatus;
  const conversations = await conversationRepo.findAll(req.user.id, query);

  await broadcastRepo.updateById(req.params.id, {
    status: 'sent',
    startedAt: new Date(),
    completedAt: new Date(),
    recipientCount: conversations.length,
    sentCount: conversations.length,
    deliveredCount: Math.floor(conversations.length * 0.95),
    readCount: Math.floor(conversations.length * 0.6),
  });
  return res.json({ ok: true, sentTo: conversations.length });
});

export default router;
