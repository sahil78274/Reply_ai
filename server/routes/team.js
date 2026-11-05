import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { teamRepo } from '../models/TeamMember.js';

const router = express.Router();

// GET /api/team
router.get('/', authenticate, async (req, res) => {
  const members = await teamRepo.findByUser(req.user.id);
  return res.json({
    members: members.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      role: m.role,
      status: m.status,
      conversationsAssigned: m.conversationsAssigned,
      lastActive: m.lastActive,
      phone: m.phone,
      avatar: m.avatar,
      createdAt: m.createdAt,
    })),
  });
});

// POST /api/team
router.post('/', authenticate, async (req, res) => {
  const { name, email, role, status, phone } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const member = await teamRepo.create({
    userId: req.user.id,
    name,
    email,
    role: role || 'agent',
    status: status || 'active',
    phone: phone || '',
  });
  return res.status(201).json({ member: { id: member._id.toString(), ...member.toObject ? member.toObject() : member } });
});

// PUT /api/team/:id
router.put('/:id', authenticate, async (req, res) => {
  const m = await teamRepo.findById(req.params.id);
  if (!m) return res.status(404).json({ error: 'Team member not found' });
  if (m.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const allowed = ['name', 'email', 'role', 'status', 'phone', 'avatar', 'conversationsAssigned'];
  const update = {};
  for (const key of allowed) {
    if (key in (req.body || {})) update[key] = req.body[key];
  }
  const updated = await teamRepo.updateById(req.params.id, update);
  return res.json({ member: { id: updated._id.toString(), ...update } });
});

// DELETE /api/team/:id
router.delete('/:id', authenticate, async (req, res) => {
  const m = await teamRepo.findById(req.params.id);
  if (!m) return res.status(404).json({ error: 'Team member not found' });
  if (m.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await teamRepo.deleteById(req.params.id);
  return res.json({ ok: true });
});

export default router;
