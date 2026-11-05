import mongoose from 'mongoose';
import { isDBConnected } from '../config/db.js';
import { getCollection } from '../utils/memoryStore.js';

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    recipientCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    readCount: { type: Number, default: 0 },
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    filter: { type: mongoose.Mixed, default: {} }, // leadStatus, tags, etc.
  },
  { timestamps: true }
);

schema.index({ userId: 1, status: 1 });

const Broadcast = mongoose.model('Broadcast', schema);
const collection = getCollection('broadcasts');

export const broadcastRepo = {
  create: async (data) => {
    if (isDBConnected()) return Broadcast.create(data);
    return collection.create(data);
  },
  findByUser: async (userId) => {
    if (isDBConnected()) return Broadcast.find({ userId }).sort({ updatedAt: -1 });
    return collection.find((d) => d.userId === userId);
  },
  findById: async (id) => {
    if (isDBConnected()) return Broadcast.findById(id);
    return collection.findById(id);
  },
  updateById: async (id, data) => {
    if (isDBConnected()) return Broadcast.findByIdAndUpdate(id, { $set: data }, { new: true });
    return collection.findByIdAndUpdate(id, { $set: data }, { new: true });
  },
  deleteById: async (id) => {
    if (isDBConnected()) return Broadcast.deleteOne({ _id: id });
    return collection.deleteOne({ _id: id });
  },
};

export default Broadcast;
