import mongoose from 'mongoose';
import { isDBConnected } from '../config/db.js';
import { getCollection } from '../utils/memoryStore.js';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['owner', 'admin'], default: 'owner' },
  },
  { timestamps: true }
);

schema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', schema);
const collection = getCollection('users');

export const userRepo = {
  create: async (data) => {
    if (isDBConnected()) return User.create(data);
    const existing = await collection.findOne({ email: data.email });
    if (existing) throw new Error('EMAIL_EXISTS');
    return collection.create(data);
  },
  findByEmail: async (email) => {
    if (isDBConnected()) return User.findOne({ email });
    return collection.findOne({ email });
  },
  findById: async (id) => {
    if (isDBConnected()) return User.findById(id);
    return collection.findById(id);
  },
  findAll: async () => {
    if (isDBConnected()) return User.find().sort({ createdAt: -1 });
    return collection.find();
  },
  updateById: async (id, data) => {
    if (isDBConnected()) return User.findByIdAndUpdate(id, { $set: data }, { new: true });
    return collection.findByIdAndUpdate(id, { $set: data }, { new: true });
  },
  deleteById: async (id) => {
    if (isDBConnected()) return User.deleteOne({ _id: id });
    return collection.deleteOne({ _id: id });
  },
  count: async () => {
    if (isDBConnected()) return User.countDocuments();
    return collection.countDocuments();
  },
};

export default User;
