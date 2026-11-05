import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Send, Users, Trash2, Plus, CheckCircle, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { cn } from '../lib/utils.js';

const STATUS_COLORS = {
  draft: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  sending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 animate-pulse',
  sent: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  cancelled: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
};

export default function BroadcastCampaigns() {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', message: '', status: 'draft', scheduledAt: '', filter: {} });

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    try {
      const data = await api.get('/broadcasts');
      setBroadcasts(data.broadcasts || []);
    } catch (err) {
      console.error('Failed to load broadcasts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    (async () => {
      try {
        if (editing) {
          await api.put(`/broadcasts/${editing}`, form);
        } else {
          await api.post('/broadcasts', form);
        }
        setOpenForm(false);
        setEditing(null);
        setForm({ name: '', message: '', status: 'draft', scheduledAt: '', filter: {} });
        loadBroadcasts();
      } catch (err) {
        console.error('Save failed', err);
      }
    })();
  };

  const handleSend = async (id) => {
    if (!window.confirm('Send this broadcast to all eligible customers?')) return;
    try {
      await api.post(`/broadcasts/${id}/send`);
      loadBroadcasts();
    } catch (err) {
      console.error('Send failed', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this broadcast?')) return;
    try {
      await api.delete(`/broadcasts/${id}`);
      loadBroadcasts();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleLeadStatusChange = (e) => {
    setForm((prev) => ({
      ...prev,
      filter: { ...prev.filter, leadStatus: e.target.value },
    }));
  };

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
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Broadcast Campaigns</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Send messages to multiple customers at once.
            </p>
          </div>
          <Button variant="primary" onClick={() => { setEditing(null); setForm({ name: '', message: '', status: 'draft', scheduledAt: '', filter: {} }); setOpenForm(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {broadcasts.length === 0 ? (
          <EmptyState
            type="default"
            title="No campaigns yet"
            subtitle="Create your first broadcast campaign to reach multiple customers."
            actionLabel="Create Campaign"
            onAction={() => { setEditing(null); setForm({ name: '', message: '', status: 'draft', scheduledAt: '', filter: {} }); setOpenForm(true); }}
          />
        ) : (
          <div className="space-y-3">
            {broadcasts.map((b) => (
              <Card key={b.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">{b.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{b.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={b.status === 'sent' ? 'success' : b.status === 'sending' ? 'warning' : b.status === 'draft' ? 'secondary' : 'outline'} className="h-6 text-xs">
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </Badge>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {b.sentCount} / {b.recipientCount} sent
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleSend(b.id)} disabled={b.status === 'sent' || b.status === 'sending'}>
                      {b.status === 'sent' ? 'Sent' : 'Send'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(b.id); setForm({ ...b }); setOpenForm(true); }}>
                      <span className="w-3 h-3">✎</span>
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(b.id)}>
                      <span className="w-3 h-3">✕</span>
                    </Button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Recipients</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{b.recipientCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Delivered</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{b.deliveredCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Read</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{b.readCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Read Rate</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {b.recipientCount > 0 ? Math.round((b.readCount / b.recipientCount) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {openForm && (
          <>
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setOpenForm(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editing ? 'Edit Campaign' : 'Create Campaign'}</h2>
                    <Button variant="ghost" size="sm" onClick={() => setOpenForm(false)}>
                      <span className="w-4 h-4">✕</span>
                    </Button>
                  </div>
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Campaign Name</label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        rows={5}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Type your broadcast message…"
                      ></textarea>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Schedule</label>
                      <Input
                        type="datetime-local"
                        value={form.scheduledAt}
                        onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Send to Lead Status</label>
                      <select
                        value={form.filter.leadStatus || ''}
                        onChange={handleLeadStatusChange}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                      >
                        <option value="">All leads</option>
                        <option value="New">New</option>
                        <option value="Interested">Interested</option>
                        <option value="Converted">Converted</option>
                        <option value="Not Interested">Not Interested</option>
                      </select>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => setOpenForm(false)}>Cancel</Button>
                      <Button variant="primary" type="submit">{editing ? 'Update Campaign' : 'Create Campaign'}</Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

