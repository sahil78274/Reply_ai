import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  Users as UsersIcon,
  Plus,
  Trash2,
  Edit3,
  ShieldAlert,
  Clock as ClockIcon,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { cn } from '../lib/utils.js';

const ROLE_COLORS = {
  owner: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
  admin: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  agent: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  viewer: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
};

const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Admin',
  agent: 'Agent',
  viewer: 'Viewer',
};

export default function TeamManagement() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'agent', status: 'active', phone: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await api.get('/team');
      setMembers(data.members || []);
    } catch (err) {
      console.error('Failed to load team', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/team/${editing}`, form);
      } else {
        await api.post('/team', form);
      }
      setOpenForm(false);
      setEditing(null);
      setForm({ name: '', email: '', role: 'agent', status: 'active', phone: '' });
      loadMembers();
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this team member?')) return;
    try {
      await api.delete(`/team/${id}`);
      loadMembers();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleToggleStatus = async (m) => {
    try {
      await api.put(`/team/${m.id}`, { status: m.status === 'active' ? 'inactive' : 'active' });
      loadMembers();
    } catch (err) {
      console.error('Toggle failed', err);
    }
  };

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.includes(q);
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Team Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage team members, roles, and conversation assignments.
            </p>
          </div>
          <Button variant="primary" onClick={() => { setEditing(null); setForm({ name: '', email: '', role: 'agent', status: 'active', phone: '' }); setOpenForm(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-end gap-4 mb-6">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search team members…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            type="default"
            title="No team members"
            subtitle="Add your first team member to start collaborating."
            actionLabel="Add Member"
            onAction={() => { setEditing(null); setForm({ name: '', email: '', role: 'agent', status: 'active', phone: '' }); setOpenForm(true); }}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((m) => (
              <Card key={m.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold">
                      {m.avatar ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}
                      {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">{m.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{m.email}</p>
                      {m.phone && <p className="text-xs text-slate-500 dark:text-slate-400">{m.phone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ROLE_COLORS[m.role].includes('bg-purple') ? 'secondary' : 'outline'} className="h-6 text-xs">
                      {ROLE_LABELS[m.role]}
                    </Badge>
                    <Badge variant={m.status === 'active' ? 'success' : 'secondary'} className="h-6 text-xs">
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </Badge>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {m.conversationsAssigned} conversations
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(m)} className="p-1.5">
                      <ShieldAlert className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(m.id); setForm({ ...m }); setOpenForm(true); }} title="Edit">
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(m.id)} title="Delete">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Member Modal */}
        {openForm && (
          <>
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setOpenForm(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-md">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editing ? 'Edit Member' : 'Add Team Member'}</h2>
                    <Button variant="ghost" size="sm" onClick={() => setOpenForm(false)}>
                      <span className="w-4 h-4">✕</span>
                    </Button>
                  </div>
                  <form onSubmit={handleSave} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                      <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                      <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                      <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                      >
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                        <option value="owner">Owner</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </form>
                  <div className="mt-8 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setOpenForm(false)}>Cancel</Button>
                    <Button variant="primary" type="submit">{editing ? 'Update Member' : 'Add Member'}</Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

