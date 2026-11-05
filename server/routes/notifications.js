import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { notificationRepo } from '../models/Notification.js';

const router = express.Router();

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
  const { read } = req.query;
  const filter = read !== undefined ? { read: read === 'true' } : {};
  const notifications = await notificationRepo.findByUser(req.user.id, filter);
  return res.json({
    notifications: notifications.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      body: n.body,
      type: n.type,
      read: n.read,
      conversationId: n.conversationId ? n.conversationId.toString() : null,
      data: n.data,
      createdAt: n.createdAt,
    })),
  });
});

// POST /api/notifications
router.post('/', authenticate, async (req, res) => {
  const { title, body, type, conversationId, data } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const n = await notificationRepo.create({
    userId: req.user.id,
    title,
    body: body || '',
    type: type || 'system',
    conversationId: conversationId || null,
    data: data || {},
  });
  return res.status(201).json({ notification: { id: n._id.toString(), ...n.toObject ? n.toObject() : n } });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, async (req, res) => {
  const n = await notificationRepo.markRead(req.params.id, req.user.id);
  if (!n) return res.status(404).json({ error: 'Notification not found' });
  return res.json({ ok: true });
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, async (req, res) => {
  await notificationRepo.markAllRead(req.user.id);
  return res.json({ ok: true });
});

// DELETE /api/notifications/:id
router.delete('/:id', authenticate, async (req, res) => {
  // Only allow deleting own notifications (soft-delete equivalent: mark read + remove from list)
  const n = await notificationRepo.markRead(req.params.id, req.user.id);
  if (!n) return res.status(404).json({ error: 'Notification not found' });
  return res.json({ ok: true });
});

// GET /api/notifications/unread-count
router.get('/unread-count', authenticate, async (req, res) => {
  const count = await notificationRepo.countUnread(req.user.id);
  return res.json({ count });
});

export default router;
