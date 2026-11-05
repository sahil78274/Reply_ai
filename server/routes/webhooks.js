import express from 'express';
import { conversationRepo } from '../models/Conversation.js';
import { messageRepo } from '../models/Message.js';
import { settingsRepo } from '../models/Settings.js';
import { knowledgeRepo } from '../models/KnowledgeBase.js';
import { generateReply } from '../services/gemini.js';
import { sendTextMessage } from '../services/whatsapp.js';
import { emitNewMessage } from '../services/socket.js';

const router = express.Router();

// Raw body needed only for the webhook route; keep other routes json.
router.use(express.json({ type: '*/*', limit: '2mb' }));

// GET /api/webhooks/whatsapp  - Meta webhook verification
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'replyai_verify';

  if (mode === 'subscribe' && token === expected) {
    console.log('[ReplyAI] Webhook verified');
    return res.status(200).send(challenge);
  }
  return res.status(403).send('Forbidden');
});

// POST /api/webhooks/whatsapp  - incoming messages from Meta
router.post('/whatsapp', async (req, res) => {
  // Always acknowledge quickly to Meta
  res.status(200).send('EVENT_RECEIVED');

  try {
    const body = req.body || {};
    if (body.object !== 'whatsapp_business_account') return;

    const entry = body.entry?.[0] || {};
    const changes = entry.changes?.[0] || {};
    const value = changes.value || {};
    const messages = value.messages || [];
    if (!messages.length) return;

    const phoneNumberId = value.metadata?.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    // Single-tenant SaaS: the first registered user owns the WhatsApp number.
    // In production, map phoneNumberId -> user via a connected accounts table.
    const { userRepo } = await import('../models/User.js');
    const all = await userRepo.findAll();
    const ownerUser = all[0];
    if (!ownerUser) return;

    for (const msg of messages) {
      // Prevent duplicate webhook processing
      const existing = await messageRepo.findByMetaId(msg.id);
      if (existing) continue;

      const from = msg.from; // customer phone
      const text = msg.text?.body || '';
      const type = msg.type || 'text';
      if (!text) continue;

      let conv = await conversationRepo.findByPhone(ownerUser._id.toString(), from);
      const isNew = !conv;
      if (isNew) {
        conv = await conversationRepo.create({
          userId: ownerUser._id.toString(),
          customerName: 'WhatsApp Customer',
          customerPhone: from,
          source: 'whatsapp',
          status: 'active',
          aiEnabled: true,
          humanTakeover: false,
          metaWebhookId: msg.id,
          unreadCount: 1,
        });
      } else {
        await conversationRepo.incrementUnread(conv._id.toString());
      }

      await conversationRepo.updateById(conv._id.toString(), {
        lastMessage: text,
        lastMessageAt: new Date(),
        lastMessageDirection: 'inbound',
      });

      const inbound = await messageRepo.create({
        conversationId: conv._id.toString(),
        userId: ownerUser._id.toString(),
        customerPhone: from,
        direction: 'inbound',
        type,
        content: text,
        source: 'whatsapp',
        status: 'delivered',
        metaMessageId: msg.id,
      });

      // AI reply if enabled and no human takeover
      let aiReplySent = false;
      try {
        const fresh = await conversationRepo.findById(conv._id.toString());
        if (fresh.aiEnabled && !fresh.humanTakeover && accessToken && phoneNumberId) {
          const history = await messageRepo.findByConversation(conv._id.toString(), 30);
          const kb = await knowledgeRepo.findByUser(ownerUser._id.toString());
          const reply = await generateReply({
            apiKey: process.env.GEMINI_API_KEY,
            message: text,
            language: (await settingsRepo.findByUser(ownerUser._id.toString()))?.aiLanguage || 'hinglish',
            personality: (await settingsRepo.findByUser(ownerUser._id.toString()))?.aiPersonality,
            knowledgeBase: kb,
            history: history.map((m) => ({
              direction: m.direction,
              content: m.content,
            })),
          });
          await sendTextMessage({ phoneNumberId, accessToken, to: from, message: reply });
          await messageRepo.create({
            conversationId: conv._id.toString(),
            userId: ownerUser._id.toString(),
            customerPhone: from,
            direction: 'outbound',
            type: 'text',
            content: reply,
            source: 'ai',
            status: 'sent',
            aiHandled: true,
          });
          await conversationRepo.updateById(conv._id.toString(), {
            lastMessage: reply,
            lastMessageAt: new Date(),
            lastMessageDirection: 'outbound',
          });
          aiReplySent = true;
        }
      } catch (err) {
        console.error('[ReplyAI] AI reply failed:', err.message);
      }

      const payload = {
        conversationId: conv._id.toString(),
        customerPhone: from,
        customerName: conv.customerName,
        message: { ...inbound.toObject ? inbound.toObject() : inbound },
        aiReplySent,
        source: 'whatsapp',
        isNew,
      };
      // Emit real-time notification if Socket.IO io is attached to the app
      try {
        const { getIO } = await import('../services/socket.js');
        const io = getIO();
        io.to(`user:${ownerUser._id.toString()}`).emit('notification', {
          type: 'new_message',
          ...payload,
          timestamp: new Date().toISOString(),
        });
        io.to(`conv:${conv._id.toString()}`).emit('new_message', payload.message);
      } catch (e) {
        // io may not be initialized yet
      }
    }
  } catch (err) {
    console.error('[ReplyAI] Webhook processing error:', err.message);
  }
});

export default router;
