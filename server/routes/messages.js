import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { conversationRepo } from '../models/Conversation.js';
import { messageRepo } from '../models/Message.js';
import { settingsRepo } from '../models/Settings.js';
import { sendTextMessage } from '../services/whatsapp.js';
import { emitNewMessage } from '../services/socket.js';
import { generateReply } from '../services/gemini.js';
import { knowledgeRepo } from '../models/KnowledgeBase.js';

const router = express.Router();

// GET /api/messages?conversationId=...
router.get('/', authenticate, async (req, res) => {
  const { conversationId } = req.query;
  if (!conversationId) return res.status(400).json({ error: 'conversationId required' });
  const conv = await conversationRepo.findById(conversationId);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  if (conv.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await conversationRepo.markRead(conversationId);
  const messages = await messageRepo.findByConversation(conversationId);
  return res.json({
    messages: messages.map((m) => ({
      id: m._id.toString(),
      direction: m.direction,
      content: m.content,
      source: m.source,
      status: m.status,
      timestamp: m.timestamp || m.createdAt,
      aiHandled: m.aiHandled,
    })),
  });
});

// POST /api/messages/send  - owner sends a manual message via WhatsApp Cloud API
router.post('/send', authenticate, async (req, res) => {
  const { conversationId, content } = req.body || {};
  if (!conversationId || !content) {
    return res.status(400).json({ error: 'conversationId and content are required' });
  }
  const conv = await conversationRepo.findById(conversationId);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  if (conv.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const settings = await settingsRepo.findByUser(req.user.id);
  const accessToken = settings && settings.whatsAppAccessToken ? settings.whatsAppAccessToken : process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = settings && settings.phoneNumberId ? settings.phoneNumberId : process.env.WHATSAPP_PHONE_NUMBER_ID;

  let metaData = null;
  let source = 'manual';
  let status = 'sent';

  try {
    if (accessToken && phoneNumberId) {
      metaData = await sendTextMessage({ phoneNumberId, accessToken, to: conv.customerPhone, message: content });
      source = 'manual';
      status = 'sent';
    } else {
      // Demo mode fallback: pretend message was sent
      source = 'demo';
      status = 'sent';
      metaData = { messages: [{ id: `demo_manual_${Date.now()}` }] };
    }
  } catch (err) {
    status = 'failed';
  }

  const message = await messageRepo.create({
    conversationId: conv._id.toString(),
    userId: req.user.id,
    customerPhone: conv.customerPhone,
    direction: 'outbound',
    type: 'text',
    content,
    source,
    status,
    metaMessageId: metaData?.messages?.[0]?.id || null,
  });

  await conversationRepo.updateById(conversationId, {
    lastMessage: content,
    lastMessageAt: new Date(),
    lastMessageDirection: 'outbound',
    unreadCount: 0,
  });

  const io = req.io;
  if (io) {
    io.to(`user:${req.user.id}`).emit('notification', {
      type: 'message_sent',
      conversationId,
      message,
      timestamp: new Date().toISOString(),
    });
    io.to(`conv:${conversationId}`).emit('new_message', message);
  }

  return res.json({
    message: {
      id: message._id.toString(),
      direction: 'outbound',
      content,
      source,
      status,
      timestamp: message.timestamp,
    },
  });
});

// POST /api/messages/webhook-receive  (test helper to simulate an inbound webhook)
router.post('/webhook-receive', authenticate, async (req, res) => {
  const { conversationId, content, customerPhone, customerName } = req.body || {};
  if (!content) return res.status(400).json({ error: 'content required' });

  let conv = null;
  if (conversationId) {
    conv = await conversationRepo.findById(conversationId);
    if (conv && conv.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  }
  if (!conv) {
    conv = await conversationRepo.findByPhone(req.user.id, customerPhone || '+910000000000');
    if (!conv) {
      conv = await conversationRepo.create({
        userId: req.user.id,
        customerName: customerName || 'Customer',
        customerPhone: customerPhone || '+910000000000',
        source: 'demo',
        status: 'active',
        aiEnabled: true,
        humanTakeover: false,
        lastMessage: content,
        lastMessageAt: new Date(),
        lastMessageDirection: 'inbound',
        unreadCount: 1,
      });
    } else {
      await conversationRepo.incrementUnread(conv._id.toString());
    }
  }

  const inbound = await messageRepo.create({
    conversationId: conv._id.toString(),
    userId: req.user.id,
    customerPhone: conv.customerPhone,
    direction: 'inbound',
    type: 'text',
    content,
    source: conv.source || 'whatsapp',
    status: 'delivered',
    aiHandled: false,
  });

  await conversationRepo.updateById(conv._id.toString(), {
    lastMessage: content,
    lastMessageAt: new Date(),
    lastMessageDirection: 'inbound',
  });

  const io = req.io;
  const populated = { ...inbound.toObject ? inbound.toObject() : inbound, conversationId: conv._id.toString() };
  if (io) {
    emitNewMessage(req.user.id, conv._id.toString(), populated, conv);
  }

  return res.json({ ok: true, conversationId: conv._id.toString(), message: populated });
});

export default router;
