import mongoose from 'mongoose';
import { isDBConnected } from '../config/db.js';
import { getCollection } from '../utils/memoryStore.js';

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'paused', 'draft'], default: 'draft', index: true },
    trigger: {
      type: String,
      enum: ['incoming_message', 'keyword', 'time_based', 'lead_status_change'],
      default: 'incoming_message',
    },
    triggerConfig: { type: mongoose.Mixed, default: {} },
    actions: [{ type: mongoose.Mixed, default: {} }],
    isDefault: { type: Boolean, default: false },
    lastRunAt: { type: Date },
    runCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ userId: 1, status: 1 });

const Workflow = mongoose.model('Workflow', schema);
const collection = getCollection('workflows');

export const workflowRepo = {
  create: async (data) => {
    if (isDBConnected()) return Workflow.create(data);
    return collection.create(data);
  },
  findByUser: async (userId) => {
    if (isDBConnected()) return Workflow.find({ userId }).sort({ updatedAt: -1 });
    return collection.find((d) => d.userId === userId);
  },
  findById: async (id) => {
    if (isDBConnected()) return Workflow.findById(id);
    return collection.findById(id);
  },
  updateById: async (id, data) => {
    if (isDBConnected()) return Workflow.findByIdAndUpdate(id, { $set: data }, { new: true });
    return collection.findByIdAndUpdate(id, { $set: data }, { new: true });
  },
  deleteById: async (id) => {
    if (isDBConnected()) return Workflow.deleteOne({ _id: id });
    return collection.deleteOne({ _id: id });
  },
  incrementRun: async (id) => {
    if (isDBConnected()) {
      return Workflow.findByIdAndUpdate(
        id,
        { $inc: { runCount: 1 }, $set: { lastRunAt: new Date() } },
        { new: true }
      );
    }
    const doc = await collection.findById(id);
    if (doc) {
      return collection.findByIdAndUpdate(id, {
        $set: { runCount: (doc.runCount || 0) + 1, lastRunAt: new Date() },
      });
    }
    return null;
  },
};

export default Workflow;
