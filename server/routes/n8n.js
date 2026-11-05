import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { conversationRepo } from '../models/Conversation.js';
import { messageRepo } from '../models/Message.js';

const router = express.Router();

// POST /api/n8n/trigger/:conversationId
// Pushes conversation data to a configured n8n webhook for automation.
router.post('/trigger/:conversationId', authenticate, async (req, res) => {
  const conv = await conversationRepo.findById(req.params.conversationId);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  if (conv.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const messages = await messageRepo.findByConversation(conv._id.toString(), 50);
  const n8nUrl = process.env.N8N_WEBHOOK_URL;

  const payload = {
    conversation: {
      id: conv._id.toString(),
      customerName: conv.customerName,
      customerPhone: conv.customerPhone,
      leadStatus: conv.leadStatus,
      tags: conv.tags,
      notes: conv.notes,
      aiEnabled: conv.aiEnabled,
      humanTakeover: conv.humanTakeover,
    },
    messages: messages.map((m) => ({
      direction: m.direction,
      content: m.content,
      timestamp: m.timestamp,
      source: m.source,
    })),
    triggeredAt: new Date().toISOString(),
  };

  if (!n8nUrl) {
    return res.status(200).json({ n8n: 'not_configured', payload });
  }

  try {
    const resp = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json().catch(() => ({}));
    return res.json({ n8n: 'sent', status: resp.status, data });
  } catch (err) {
    return res.status(502).json({ n8n: 'error', error: err.message, payload });
  }
});

export default router;
