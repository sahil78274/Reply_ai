import mongoose from 'mongoose';
import { isDBConnected } from '../config/db.js';
import { getCollection } from '../utils/memoryStore.js';

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: ['owner', 'admin', 'agent', 'viewer'],
      default: 'agent',
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    conversationsAssigned: { type: Number, default: 0 },
    lastActive: { type: Date },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

schema.index({ userId: 1, email: 1 }, { unique: true });

const TeamMember = mongoose.model('TeamMember', schema);
const collection = getCollection('teammembers');

export const teamRepo = {
  create: async (data) => {
    if (isDBConnected()) return TeamMember.create(data);
    return collection.create(data);
  },
  findByUser: async (userId) => {
    if (isDBConnected()) return TeamMember.find({ userId }).sort({ createdAt: -1 });
    return collection.find((d) => d.userId === userId);
  },
  findById: async (id) => {
    if (isDBConnected()) return TeamMember.findById(id);
    return collection.findById(id);
  },
  updateById: async (id, data) => {
    if (isDBConnected()) return TeamMember.findByIdAndUpdate(id, { $set: data }, { new: true });
    return collection.findByIdAndUpdate(id, { $set: data }, { new: true });
  },
  deleteById: async (id) => {
    if (isDBConnected()) return TeamMember.deleteOne({ _id: id });
    return collection.deleteOne({ _id: id });
  },
};

export default TeamMember;
