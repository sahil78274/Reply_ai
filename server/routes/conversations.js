import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { conversationRepo } from '../models/Conversation.js';
import { messageRepo } from '../models/Message.js';

const router = express.Router();

// GET /api/conversations  - list with optional ?status= filter
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { status, search } = req.query;
  let filter = {};
  if (status) filter.status = status;
  if (search) {
    // memory store fallback does regex-free matching; keep it simple
    filter.$search = search;
  }
  const conversations = await conversationRepo.findAll(userId, filter);
  let items = conversations.map((c) => ({
    id: c._id.toString(),
    conversationId: c._id.toString(),
    customerName: c.customerName,
    customerPhone: c.customerPhone,
    status: c.status,
    aiEnabled: c.aiEnabled,
    humanTakeover: c.humanTakeover,
    leadStatus: c.leadStatus,
    tags: c.tags || [],
    notes: c.notes || '',
    unreadCount: c.unreadCount || 0,
    lastMessage: c.lastMessage || '',
    lastMessageAt: c.lastMessageAt || c.updatedAt,
    lastMessageDirection: c.lastMessageDirection || '',
    source: c.source || 'whatsapp',
  }));
  if (filter.$search) {
    const q = String(filter.$search).toLowerCase();
    items = items.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.customerPhone.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }
  return res.json({ conversations: items });
});

// GET /api/conversations/stats
router.get('/stats', authenticate, async (req, res) => {
  const userId = req.user.id;
  const stats = await conversationRepo.aggregateStats(userId);
  const [msgToday, aiToday] = await Promise.all([
    messageRepo.countToday(userId),
    messageRepo.countAiToday(userId),
  ]);
  return res.json({
    totalConversations: stats.total,
    messagesReceivedToday: msgToday,
    aiRepliesSent: aiToday,
    humanHandledConversations: stats.human,
    activeConversations: stats.active,
    unansweredMessages: stats.unanswered,
    aiAutomationOn: stats.aiOn > 0,
  });
});

// GET /api/conversations/:id
router.get('/:id', authenticate, async (req, res) => {
  const conv = await conversationRepo.findById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  if (conv.userId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const messages = await messageRepo.findByConversation(conv._id.toString());
  return res.json({
    conversation: {
      id: conv._id.toString(),
      customerName: conv.customerName,
      customerPhone: conv.customerPhone,
      status: conv.status,
      aiEnabled: conv.aiEnabled,
      humanTakeover: conv.humanTakeover,
      leadStatus: conv.leadStatus,
      tags: conv.tags || [],
      notes: conv.notes || '',
      unreadCount: conv.unreadCount || 0,
      source: conv.source || 'whatsapp',
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    },
    messages: messages.map((m) => ({
      id: m._id.toString(),
      conversationId: m.conversationId.toString(),
      direction: m.direction,
      type: m.type,
      content: m.content,
      source: m.source,
      status: m.status,
      timestamp: m.timestamp || m.createdAt,
      aiHandled: m.aiHandled,
      escalated: m.escalated,
    })),
  });
});

// PUT /api/conversations/:id/takeover  - owner takes over, AI stops
router.put('/:id/takeover', authenticate, async (req, res) => {
  const conv = await conversationRepo.findById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  if (conv.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const updated = await conversationRepo.updateById(req.params.id, {
    aiEnabled: false,
    humanTakeover: true,
    status: 'active',
  });
  req.io.to(`conv:${req.params.id}`).emit('ai_status_changed', {
    conversationId: req.params.id,
    aiEnabled: false,
    humanTakeover: true,
  });
  return res.json({ conversation: { id: updated._id.toString(), aiEnabled: updated.aiEnabled, humanTakeover: updated.humanTakeover } });
});

// PUT /api/conversations/:id/resume-ai
router.put('/:id/resume-ai', authenticate, async (req, res) => {
  const conv = await conversationRepo.findById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  if (conv.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const updated = await conversationRepo.updateById(req.params.id, {
    aiEnabled: true,
    humanTakeover: false,
  });
  req.io.to(`conv:${req.params.id}`).emit('ai_status_changed', {
    conversationId: req.params.id,
    aiEnabled: true,
    humanTakeover: false,
  });
  return res.json({ conversation: { id: updated._id.toString(), aiEnabled: updated.aiEnabled, humanTakeover: updated.humanTakeover } });
});

// PUT /api/conversations/:id  - tags, lead status, notes
router.put('/:id', authenticate, async (req, res) => {
  const conv = await conversationRepo.findById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  if (conv.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const { tags, leadStatus, notes, status } = req.body || {};
  const update = {};
  if (tags !== undefined) update.tags = tags;
  if (leadStatus !== undefined) update.leadStatus = leadStatus;
  if (notes !== undefined) update.notes = notes;
  if (status !== undefined) update.status = status;
  const updated = await conversationRepo.updateById(req.params.id, update);
  return res.json({ conversation: { id: updated._id.toString(), ...update } });
});

// DELETE /api/conversations/:id
router.delete('/:id', authenticate, async (req, res) => {
  const conv = await conversationRepo.findById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  if (conv.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await conversationRepo.deleteById(req.params.id);
  return res.json({ ok: true });
});

export default router;
