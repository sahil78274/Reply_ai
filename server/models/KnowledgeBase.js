import mongoose from 'mongoose';
import { isDBConnected } from '../config/db.js';
import { getCollection } from '../utils/memoryStore.js';

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    businessName: { type: String, default: '' },
    businessDescription: { type: String, default: '' },
    productsAndServices: [{ name: String, description: String, price: String }],
    pricing: [{ item: String, price: String, details: String }],
    businessTimings: { type: String, default: '' },
    faqs: [{ question: String, answer: String }],
    contactInformation: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

schema.index({ userId: 1 }, { unique: true });

const KnowledgeBase = mongoose.model('KnowledgeBase', schema);
const collection = getCollection('knowledge');

export const knowledgeRepo = {
  findByUser: async (userId) => {
    if (isDBConnected()) return KnowledgeBase.findOne({ userId });
    return collection.findOne((d) => d.userId === userId);
  },
  upsert: async (userId, data) => {
    if (isDBConnected()) {
      return KnowledgeBase.findOneAndUpdate({ userId }, { ...data, updatedAt: new Date() }, { upsert: true, new: true });
    }
    const existing = await collection.findOne((d) => d.userId === userId);
    if (existing) return collection.findByIdAndUpdate(existing._id, { $set: { ...data, updatedAt: new Date() } }, { new: true });
    return collection.create({ userId, ...data });
  },
};

export default KnowledgeBase;
