import mongoose from 'mongoose';
import { isDBConnected } from '../config/db.js';
import { getCollection } from '../utils/memoryStore.js';

const schema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    customerPhone: { type: String, index: true },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true, index: true },
    type: { type: String, enum: ['text', 'image', 'system'], default: 'text' },
    content: { type: String, required: true },
    source: {
      type: String,
      enum: ['whatsapp', 'ai', 'manual', 'demo', 'system'],
      required: true,
    },
    status: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
      default: 'sent',
    },
    metaMessageId: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
    aiHandled: { type: Boolean, default: false },
    escalated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

schema.index({ conversationId: 1, timestamp: 1 });
schema.index({ metaMessageId: 1 }, { unique: true, partialFilterExpression: { metaMessageId: { $exists: true } } });

const Message = mongoose.model('Message', schema);
const collection = getCollection('messages');

export const messageRepo = {
  create: async (data) => {
    if (isDBConnected()) return Message.create(data);
    return collection.create(data);
  },
  findByMetaId: async (metaMessageId) => {
    if (isDBConnected()) return Message.findOne({ metaMessageId });
    return collection.findOne((d) => d.metaMessageId === metaMessageId);
  },
  findByConversation: async (conversationId, limit = 100) => {
    if (isDBConnected()) return Message.find({ conversationId }).sort({ timestamp: 1 }).limit(limit);
    const docs = await collection.find((d) => d.conversationId === conversationId);
    return docs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).slice(0, limit);
  },
  findAll: async (userId, filter = {}) => {
    if (isDBConnected()) return Message.find({ userId, ...filter }).sort({ timestamp: -1 }).limit(filter.limit || 200);
    const docs = await collection.find((d) => d.userId === userId);
    return docs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, filter.limit || 200);
  },
  updateById: async (id, data) => {
    if (isDBConnected()) return Message.findByIdAndUpdate(id, { $set: data }, { new: true });
    return collection.findByIdAndUpdate(id, { $set: data }, { new: true });
  },
  countToday: async (userId) => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    if (isDBConnected()) return Message.countDocuments({ userId, direction: 'inbound', timestamp: { $gte: start } });
    const docs = await collection.find((d) => d.userId === userId && d.direction === 'inbound' && new Date(d.timestamp) >= start);
    return docs.length;
  },
  countOutboundToday: async (userId) => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    if (isDBConnected()) return Message.countDocuments({ userId, direction: 'outbound', timestamp: { $gte: start } });
    const docs = await collection.find((d) => d.userId === userId && d.direction === 'outbound' && new Date(d.timestamp) >= start);
    return docs.length;
  },
  countAiToday: async (userId) => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    if (isDBConnected()) return Message.countDocuments({ userId, source: 'ai', timestamp: { $gte: start } });
    const docs = await collection.find((d) => d.userId === userId && d.source === 'ai' && new Date(d.timestamp) >= start);
    return docs.length;
  },
  aggregateDaily: async (userId) => {
    if (isDBConnected()) {
      return Message.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            inbound: { $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] } },
            outbound: { $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    }
    const docs = await collection.find((d) => d.userId === userId);
    const byDay = {};
    for (const d of docs) {
      const day = new Date(d.timestamp).toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = { inbound: 0, outbound: 0 };
      byDay[day][d.direction === 'inbound' ? 'inbound' : 'outbound'] += 1;
    }
    return Object.entries(byDay).map(([_id, v]) => ({ _id, ...v })).sort((a, b) => a._id.localeCompare(b._id));
  },
};

export default Message;
