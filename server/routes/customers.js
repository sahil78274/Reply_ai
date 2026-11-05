import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { conversationRepo } from '../models/Conversation.js';
import { messageRepo } from '../models/Message.js';

const router = express.Router();

// GET /api/customers
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.id;
  const conversations = await conversationRepo.findAll(userId);
  const customers = conversations.map((c) => ({
    id: c._id.toString(),
    conversationId: c._id.toString(),
    name: c.customerName,
    phone: c.customerPhone,
    status: c.status,
    leadStatus: c.leadStatus,
    tags: c.tags || [],
    notes: c.notes || '',
    unreadCount: c.unreadCount || 0,
    lastMessage: c.lastMessage || '',
    lastMessageAt: c.lastMessageAt || c.updatedAt,
    aiEnabled: c.aiEnabled,
    humanTakeover: c.humanTakeover,
    source: c.source || 'whatsapp',
  }));
  return res.json({ customers });
});

// GET /api/customers/export-csv
router.get('/export-csv', authenticate, async (req, res) => {
  const userId = req.user.id;
  const conversations = await conversationRepo.findAll(userId);
  const rows = conversations.map((c) => ({
    name: c.customerName,
    phone: c.customerPhone,
    leadStatus: c.leadStatus,
    tags: (c.tags || []).join('; '),
    notes: c.notes || '',
    status: c.status,
    unreadCount: c.unreadCount || 0,
    lastMessageAt: c.lastMessageAt || c.updatedAt,
  }));
  const header = ['name', 'phone', 'leadStatus', 'tags', 'notes', 'status', 'unreadCount', 'lastMessageAt'];
  const escape = (v) => {
    const s = String(v == null ? '' : v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [header.join(','), ...rows.map((r) => header.map((h) => escape(r[h])).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="replyai-leads.csv"');
  return res.send(csv);
});

// PUT /api/customers/:id
router.put('/:id', authenticate, async (req, res) => {
  const { tags, leadStatus, notes, status } = req.body || {};
  const update = {};
  if (tags !== undefined) update.tags = tags;
  if (leadStatus !== undefined) update.leadStatus = leadStatus;
  if (notes !== undefined) update.notes = notes;
  if (status !== undefined) update.status = status;
  const updated = await conversationRepo.updateById(req.params.id, update);
  if (!updated) return res.status(404).json({ error: 'Customer not found' });
  return res.json({ ok: true });
});

export default router;
