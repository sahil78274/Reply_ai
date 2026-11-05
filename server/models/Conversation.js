import mongoose from 'mongoose';
import { isDBConnected } from '../config/db.js';
import { getCollection } from '../utils/memoryStore.js';

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    customerPhone: { type: String, required: true, index: true },
    customerName: { type: String, default: 'Unknown Customer' },
    source: { type: String, enum: ['whatsapp', 'demo'], default: 'whatsapp', index: true },
    status: {
      type: String,
      enum: ['active', 'closed', 'archived'],
      default: 'active',
      index: true,
    },
    aiEnabled: { type: Boolean, default: true, index: true },
    humanTakeover: { type: Boolean, default: false, index: true },
    leadStatus: {
      type: String,
      enum: ['New', 'Interested', 'Converted', 'Not Interested'],
      default: 'New',
      index: true,
    },
    tags: [{ type: String }],
    notes: { type: String, default: '' },
    unreadCount: { type: Number, default: 0 },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessageDirection: { type: String, enum: ['inbound', 'outbound'], default: '' },
    metaWebhookId: { type: String, index: true },
  },
  { timestamps: true }
);

schema.index({ userId: 1, customerPhone: 1 }, { unique: true });
schema.index({ lastMessageAt: -1 });

const Conversation = mongoose.model('Conversation', schema);
const collection = getCollection('conversations');

export const conversationRepo = {
  create: async (data) => {
    if (isDBConnected()) return Conversation.create(data);
    const exists = await collection.findOne({ customerPhone: data.customerPhone, userId: data.userId });
    if (exists) return exists;
    return collection.create(data);
  },
  findByPhone: async (userId, customerPhone) => {
    if (isDBConnected()) return Conversation.findOne({ userId, customerPhone });
    return collection.findOne((d) => d.userId === userId && d.customerPhone === customerPhone);
  },
  findById: async (id) => {
    if (isDBConnected()) return Conversation.findById(id);
    return collection.findById(id);
  },
  findByMetaId: async (metaWebhookId) => {
    if (isDBConnected()) return Conversation.findOne({ metaWebhookId });
    return collection.findOne((d) => d.metaWebhookId === metaWebhookId);
  },
  findAll: async (userId, filter = {}) => {
    const query = { userId, ...filter };
    if (isDBConnected()) return Conversation.find(query).sort({ lastMessageAt: -1 });
    return collection.find((d) => d.userId === userId && (!filter.status || d.status === filter.status));
  },
  updateById: async (id, data) => {
    if (isDBConnected()) return Conversation.findByIdAndUpdate(id, { $set: data }, { new: true });
    return collection.findByIdAndUpdate(id, { $set: data }, { new: true });
  },
  incrementUnread: async (id) => {
    if (isDBConnected()) return Conversation.findByIdAndUpdate(id, { $inc: { unreadCount: 1 } }, { new: true });
    const doc = await collection.findById(id);
    if (doc) return collection.findByIdAndUpdate(id, { $set: { unreadCount: (doc.unreadCount || 0) + 1 } }, { new: true });
    return null;
  },
  markRead: async (id) => {
    if (isDBConnected()) return Conversation.findByIdAndUpdate(id, { $set: { unreadCount: 0 } }, { new: true });
    return collection.findByIdAndUpdate(id, { $set: { unreadCount: 0 } }, { new: true });
  },
  count: async (userId) => {
    if (isDBConnected()) return Conversation.countDocuments({ userId });
    const docs = await collection.find((d) => d.userId === userId);
    return docs.length;
  },
  aggregateStats: async (userId) => {
    if (isDBConnected()) {
      const [total, active, aiOn, human, unanswered] = await Promise.all([
        Conversation.countDocuments({ userId }),
        Conversation.countDocuments({ userId, status: 'active' }),
        Conversation.countDocuments({ userId, aiEnabled: true, humanTakeover: false }),
        Conversation.countDocuments({ userId, humanTakeover: true }),
        Conversation.countDocuments({ userId, unreadCount: { $gt: 0 } }),
      ]);
      return { total, active, aiOn, human, unanswered };
    }
    const docs = await collection.find((d) => d.userId === userId);
    return {
      total: docs.length,
      active: docs.filter((d) => d.status === 'active').length,
      aiOn: docs.filter((d) => d.aiEnabled && !d.humanTakeover).length,
      human: docs.filter((d) => d.humanTakeover).length,
      unanswered: docs.filter((d) => (d.unreadCount || 0) > 0).length,
    };
  },
};

export default Conversation;
