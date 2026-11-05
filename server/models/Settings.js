import mongoose from 'mongoose';
import { isDBConnected } from '../config/db.js';
import { getCollection as gc } from '../utils/memoryStore.js';

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    geminiApiKey: { type: String, default: '' },
    whatsAppAccessToken: { type: String, default: '' },
    phoneNumberId: { type: String, default: '' },
    whatsAppBusinessAccountId: { type: String, default: '' },
    webhookVerifyToken: { type: String, default: '' },
    aiLanguage: { type: String, enum: ['en', 'hi', 'hinglish'], default: 'hinglish' },
    aiPersonality: { type: String, default: 'Friendly, helpful, and professional WhatsApp Business assistant' },
    notifyNewMessage: { type: Boolean, default: true },
    notifyNewEnquiry: { type: Boolean, default: true },
    notifyUnanswered: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    demoMode: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.index({ userId: 1 }, { unique: true });

const Settings = mongoose.model('Settings', schema);
const collection = gc('settings');

const MASKED_FIELDS = ['geminiApiKey', 'whatsAppAccessToken', 'webhookVerifyToken'];

export const settingsRepo = {
  findByUser: async (userId) => {
    if (isDBConnected()) return Settings.findOne({ userId });
    return collection.findOne((d) => d.userId === userId);
  },
  upsert: async (userId, data) => {
    if (isDBConnected()) {
      return Settings.findOneAndUpdate({ userId }, { ...data, updatedAt: new Date() }, { upsert: true, new: true });
    }
    const existing = await collection.findOne((d) => d.userId === userId);
    if (existing) return collection.findByIdAndUpdate(existing._id, { $set: { ...data, updatedAt: new Date() } }, { new: true });
    return collection.create({ userId, ...data });
  },
  getPublic: async (userId) => {
    const doc = await settingsRepo.findByUser(userId);
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    for (const field of MASKED_FIELDS) {
      if (obj[field]) obj[field] = '***SET***';
    }
    return obj;
  },
};

export default Settings;
