/**
 * Demo mode seed: realistic sample conversations so the dashboard can be
 * tested without a real WhatsApp account. All seeded records carry
 * source: 'demo' and are clearly distinguishable from real messages.
 */
import bcrypt from 'bcryptjs';
import { userRepo } from '../models/User.js';
import { conversationRepo } from '../models/Conversation.js';
import { messageRepo } from '../models/Message.js';
import { workflowRepo } from '../models/Workflow.js';
import { broadcastRepo } from '../models/Broadcast.js';
import { teamRepo } from '../models/TeamMember.js';
import { notificationRepo } from '../models/Notification.js';

const DEMO_USER = {
  name: 'Demo Owner',
  email: 'demo@replyai.com',
  password: 'demo1234',
};

const CONVERSATIONS = [
  {
    customerName: 'Rahul Sharma',
    customerPhone: '+919876543210',
    leadStatus: 'Interested',
    tags: ['pricing', 'demo'],
    notes: 'Asked about wholesale pricing for organic cotton shirts.',
  },
  {
    customerName: 'Priya Mehta',
    customerPhone: '+919123456789',
    leadStatus: 'New',
    tags: ['enquiry'],
    notes: 'First time enquirer, wants store address.',
  },
  {
    customerName: 'Amit Singh',
    customerPhone: '+919988776655',
    leadStatus: 'Converted',
    tags: ['vip'],
    notes: 'Regular buyer, last order delivered on Tuesday.',
  },
  {
    customerName: 'Sneha Reddy',
    customerPhone: '+919001122334',
    leadStatus: 'Not Interested',
    tags: ['cold'],
    notes: 'Declined - budget constraints.',
  },
  {
    customerName: 'Kabir Khan',
    customerPhone: '+919334455667',
    leadStatus: 'New',
    tags: ['unanswered'],
    notes: '',
  },
];

const MESSAGES = [
  // Rahul
  { conv: 0, direction: 'inbound', content: 'Hi, do you have organic cotton shirts in bulk? I need around 50 pieces.', source: 'whatsapp', aiHandled: true },
  { conv: 0, direction: 'outbound', content: 'Hi Rahul! Yes, we have organic cotton shirts available in bulk. Would you like our wholesale catalogue and pricing?', source: 'ai', aiHandled: true },
  { conv: 0, direction: 'inbound', content: 'Yes please send the catalogue. Also what is your MOQ?', source: 'whatsapp', aiHandled: true },
  { conv: 0, direction: 'outbound', content: 'Our MOQ is 30 pieces. Sending the catalogue to you now on WhatsApp.', source: 'ai', aiHandled: true },
  { conv: 0, direction: 'inbound', content: 'Great, I will check and get back to you tomorrow.', source: 'whatsapp', aiHandled: true },
  // Priya
  { conv: 1, direction: 'inbound', content: 'Hello, I saw your ad on Instagram. Where is your store located?', source: 'whatsapp', aiHandled: true },
  { conv: 1, direction: 'outbound', content: 'Hi Priya! Our store is at 12 Brigade Road, Bengaluru - 560025. We are open 10 AM to 8 PM daily.', source: 'ai', aiHandled: true },
  { conv: 1, direction: 'inbound', content: 'Thanks! Do you have parking nearby?', source: 'whatsapp', aiHandled: true },
  { conv: 1, direction: 'outbound', content: 'Yes, there is free parking right behind the store. See you soon!', source: 'ai', aiHandled: true },
  // Amit (human takeover example)
  { conv: 2, direction: 'inbound', content: 'Hi, I need to return my last order. The shirt size is wrong.', source: 'whatsapp', aiHandled: true },
  { conv: 2, direction: 'outbound', content: 'Hi Amit, I am forwarding this to our owner who will help you with the return personally.', source: 'ai', aiHandled: true },
  { conv: 2, direction: 'inbound', content: 'Okay, please let them know it is urgent.', source: 'whatsapp', aiHandled: false },
  // Sneha
  { conv: 3, direction: 'inbound', content: 'Hi, your prices are too high for me.', source: 'whatsapp', aiHandled: true },
  { conv: 3, direction: 'outbound', content: 'Hi Sneha, we understand. We do run seasonal discounts - shall I notify you when the next sale starts?', source: 'ai', aiHandled: true },
  // Kabir (unanswered)
  { conv: 4, direction: 'inbound', content: 'Hello, are you available for custom orders?', source: 'whatsapp', aiHandled: false },
];

export default async function seedDemo() {
  let user;
  try {
    user = await userRepo.findByEmail(DEMO_USER.email);
  } catch (e) {
    user = null;
  }
  if (!user) {
    user = await userRepo.create({ ...DEMO_USER, password: await bcrypt.hash(DEMO_USER.password, 10) });
  }

  // Only seed if conversations collection is empty (avoid duplicates on restart)
  try {
    const existing = await conversationRepo.findAll(user._id.toString());
    if (existing && existing.length > 0) return user;
  } catch (e) {
    // ignore
  }

  const now = new Date();
  const createdConvs = [];
  for (let i = 0; i < CONVERSATIONS.length; i++) {
    const c = CONVERSATIONS[i];
    const base = new Date(now.getTime() - (4 - i) * 24 * 60 * 60 * 1000);
    const convData = {
      userId: user._id,
      customerName: c.customerName,
      customerPhone: c.customerPhone,
      source: 'demo',
      status: 'active',
      aiEnabled: i !== 2, // Amit's conversation is under human takeover
      humanTakeover: i === 2,
      leadStatus: c.leadStatus,
      tags: c.tags,
      notes: c.notes,
      lastMessage: '',
      lastMessageAt: base,
      lastMessageDirection: 'inbound',
      unreadCount: i === 4 ? 1 : 0, // Kabir is unanswered
      metaWebhookId: `demo_${i}`,
    };
    const conv = await conversationRepo.create(convData);
    createdConvs.push(conv);

    const msgs = MESSAGES.filter((m) => m.conv === i);
    let seq = 0;
    for (const m of msgs) {
      const ts = new Date(base.getTime() + seq * 10 * 60 * 1000);
      await messageRepo.create({
        conversationId: conv._id,
        userId: user._id,
        customerPhone: c.customerPhone,
        direction: m.direction,
        type: 'text',
        content: m.content,
        source: 'demo',
        status: 'read',
        timestamp: ts,
        metaMessageId: `demo_msg_${i}_${seq}`,
        aiHandled: m.aiHandled,
        escalated: i === 2 && m.direction === 'inbound' && seq > 1,
      });
      seq += 1;
    }

    const last = msgs[msgs.length - 1];
    await conversationRepo.updateById(conv._id, {
      lastMessage: last.content,
      lastMessageAt: new Date(base.getTime() + seq * 10 * 60 * 1000),
      lastMessageDirection: last.direction,
    });
  }

  // Seed demo team members
  await teamRepo.create({
    userId: user._id,
    name: 'Sarah Johnson',
    email: 'sarah@demo.com',
    role: 'admin',
    status: 'active',
    conversationsAssigned: 2,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    phone: '+919876543211',
  });
  await teamRepo.create({
    userId: user._id,
    name: 'Mike Chen',
    email: 'mike@demo.com',
    role: 'agent',
    status: 'active',
    conversationsAssigned: 1,
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
    phone: '+919123456788',
  });

  // Seed demo workflows
  await workflowRepo.create({
    userId: user._id,
    name: 'Auto-reply to pricing enquiries',
    description: 'When a customer asks about pricing, send the standard price list.',
    status: 'active',
    trigger: 'keyword',
    triggerConfig: { keywords: ['price', 'pricing', 'cost', 'rate'] },
    actions: [{ type: 'send_message', content: 'Our pricing starts at ₹499. Would you like the full catalogue?' }],
    isDefault: true,
    runCount: 12,
    lastRunAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  });
  await workflowRepo.create({
    userId: user._id,
    name: 'Escalate complaints to human',
    description: 'If a customer uses words like refund or complaint, pause AI and notify owner.',
    status: 'active',
    trigger: 'keyword',
    triggerConfig: { keywords: ['refund', 'complaint', 'angry', 'unhappy'] },
    actions: [{ type: 'human_takeover' }, { type: 'notify_owner' }],
    isDefault: false,
    runCount: 3,
    lastRunAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  });
  await workflowRepo.create({
    userId: user._id,
    name: 'Welcome new customers',
    description: 'Send a warm welcome message to every new conversation.',
    status: 'paused',
    trigger: 'incoming_message',
    triggerConfig: {},
    actions: [{ type: 'send_message', content: 'Welcome to our store! How can we help you today?' }],
    isDefault: false,
    runCount: 0,
  });

  // Seed demo broadcasts
  await broadcastRepo.create({
    userId: user._id,
    name: 'Summer Sale Announcement',
    message: 'Hi! Our summer sale is live - 20% off all organic cotton shirts this week only.',
    status: 'sent',
    recipientCount: 45,
    sentCount: 45,
    deliveredCount: 43,
    readCount: 28,
    scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60000),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 300000),
    filter: { leadStatus: 'Interested' },
  });
  await broadcastRepo.create({
    userId: user._id,
    name: 'New Collection Launch',
    message: 'Our new autumn collection just arrived. Visit us this weekend!',
    status: 'draft',
    recipientCount: 0,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    filter: { leadStatus: 'New' },
  });

  // Seed demo notifications
  await notificationRepo.create({
    userId: user._id,
    title: 'New message from Rahul Sharma',
    body: 'Hi, do you have organic cotton shirts in bulk?',
    type: 'new_message',
    read: false,
    conversationId: createdConvs[0]?._id,
  });
  await notificationRepo.create({
    userId: user._id,
    title: 'AI paused - Human takeover active',
    body: 'AI has been paused for Amit Singh conversation.',
    type: 'ai_status',
    read: false,
  });
  await notificationRepo.create({
    userId: user._id,
    title: 'Unanswered conversation',
    body: 'Kabir Khan has been waiting for 2 hours.',
    type: 'unanswered',
    read: false,
  });
  await notificationRepo.create({
    userId: user._id,
    title: 'Welcome to ReplyAI',
    body: 'Your WhatsApp Business AI assistant is ready.',
    type: 'system',
    read: true,
  });

  console.log(`[ReplyAI] Demo seeded: ${createdConvs.length} conversations, workflows, broadcasts, team, notifications`);
  return user;
}
