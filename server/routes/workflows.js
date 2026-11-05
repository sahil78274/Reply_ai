import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { workflowRepo } from '../models/Workflow.js';

const router = express.Router();

// GET /api/workflows
router.get('/', authenticate, async (req, res) => {
  const workflows = await workflowRepo.findByUser(req.user.id);
  return res.json({
    workflows: workflows.map((w) => ({
      id: w._id.toString(),
      name: w.name,
      description: w.description,
      status: w.status,
      trigger: w.trigger,
      triggerConfig: w.triggerConfig,
      actions: w.actions,
      isDefault: w.isDefault,
      lastRunAt: w.lastRunAt,
      runCount: w.runCount,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    })),
  });
});

// POST /api/workflows
router.post('/', authenticate, async (req, res) => {
  const { name, description, trigger, triggerConfig, actions, isDefault } = req.body || {};
  if (!name || !trigger) {
    return res.status(400).json({ error: 'Name and trigger are required' });
  }
  const workflow = await workflowRepo.create({
    userId: req.user.id,
    name,
    description: description || '',
    status: 'draft',
    trigger,
    triggerConfig: triggerConfig || {},
    actions: actions || [],
    isDefault: isDefault || false,
  });
  return res.status(201).json({ workflow: { id: workflow._id.toString(), ...workflow.toObject ? workflow.toObject() : workflow } });
});

// PUT /api/workflows/:id
router.put('/:id', authenticate, async (req, res) => {
  const wf = await workflowRepo.findById(req.params.id);
  if (!wf) return res.status(404).json({ error: 'Workflow not found' });
  if (wf.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const allowed = ['name', 'description', 'status', 'trigger', 'triggerConfig', 'actions', 'isDefault'];
  const update = {};
  for (const key of allowed) {
    if (key in (req.body || {})) update[key] = req.body[key];
  }
  const updated = await workflowRepo.updateById(req.params.id, update);
  return res.json({ workflow: { id: updated._id.toString(), ...update } });
});

// DELETE /api/workflows/:id
router.delete('/:id', authenticate, async (req, res) => {
  const wf = await workflowRepo.findById(req.params.id);
  if (!wf) return res.status(404).json({ error: 'Workflow not found' });
  if (wf.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await workflowRepo.deleteById(req.params.id);
  return res.json({ ok: true });
});

// POST /api/workflows/:id/run - simulate running a workflow
router.post('/:id/run', authenticate, async (req, res) => {
  const wf = await workflowRepo.findById(req.params.id);
  if (!wf) return res.status(404).json({ error: 'Workflow not found' });
  if (wf.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const updated = await workflowRepo.incrementRun(req.params.id);
  return res.json({
    ok: true,
    runCount: updated ? (updated.runCount || 0) : 0,
    lastRunAt: updated ? updated.lastRunAt : null,
  });
});

export default router;
