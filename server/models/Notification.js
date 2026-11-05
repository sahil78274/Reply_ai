import mongoose from 'mongoose';
import { isDBConnected } from '../config/db.js';
import { getCollection } from '../utils/memoryStore.js';

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    type: {
      type: String,
      enum: ['new_message', 'new_enquiry', 'unanswered', 'ai_status', 'system', 'broadcast'],
      default: 'new_message',
    },
    read: { type: Boolean, default: false, index: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    data: { type: mongoose.Mixed, default: {} },
  },
  { timestamps: true }
);

schema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', schema);
const collection = getCollection('notifications');

export const notificationRepo = {
  create: async (data) => {
    if (isDBConnected()) return Notification.create(data);
    return collection.create(data);
  },
  findByUser: async (userId, filter = {}) => {
    if (isDBConnected()) return Notification.find({ userId, ...filter }).sort({ createdAt: -1 }).limit(100);
    const docs = await collection.find((d) => d.userId === userId && (filter.read !== undefined ? d.read === filter.read : true));
    return docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 100);
  },
  markRead: async (id, userId) => {
    if (isDBConnected()) return Notification.findOneAndUpdate({ _id: id, userId }, { $set: { read: true } }, { new: true });
    const doc = await collection.findOne((d) => d._id === id && d.userId === userId);
    if (doc) return collection.findByIdAndUpdate(id, { $set: { read: true } }, { new: true });
    return null;
  },
  markAllRead: async (userId) => {
    if (isDBConnected()) return Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    const docs = await collection.find((d) => d.userId === userId && !d.read);
    for (const d of docs) await collection.findByIdAndUpdate(d._id, { $set: { read: true } });
    return { modifiedCount: docs.length };
  },
  countUnread: async (userId) => {
    if (isDBConnected()) return Notification.countDocuments({ userId, read: false });
    const docs = await collection.find((d) => d.userId === userId && !d.read);
    return docs.length;
  },
};

export default Notification;
