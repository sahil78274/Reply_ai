import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  Mail,
  Play,
  Pause,
  Trash2,
  Edit3,
  Plus,
  Zap,
  Clock as ClockIcon,
  Bot as BotIcon,
  UserRound,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { cn } from '../lib/utils.js';

const TRIGGERS = [
  { value: 'incoming_message', label: 'Incoming Message', icon: Mail },
  { value: 'keyword', label: 'Keyword Match', icon: BotIcon },
  { value: 'time_based', label: 'Time Based', icon: ClockIcon },
  { value: 'lead_status_change', label: 'Lead Status Change', icon: UserRound },
];

const ACTIONS = [
  { value: 'send_message', label: 'Send AI Message', icon: BotIcon },
  { value: 'human_takeover', label: 'Human Takeover', icon: UserRound },
  { value: 'notify_owner', label: 'Notify Owner', icon: AlertTriangle },
];

export default function AutomationWorkflows() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'draft',
    trigger: 'incoming_message',
    triggerConfig: {},
    actions: [],
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await api.get('/workflows');
      setWorkflows(data.workflows || []);
    } catch (err) {
      console.error('Failed to load workflows', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerLabel = (v) => TRIGGERS.find((t) => t.value === v)?.label || v;
  const actionLabel = (v) => ACTIONS.find((a) => a.value === v)?.label || v;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/workflows/${editing}`, form);
      } else {
        await api.post('/workflows', form);
      }
      setOpenForm(false);
      setEditing(null);
      setForm({ name: '', description: '', status: 'draft', trigger: 'incoming_message', triggerConfig: {}, actions: [] });
      loadWorkflows();
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const handleRun = async (id) => {
    try {
      await api.post(`/workflows/${id}/run`);
      loadWorkflows();
    } catch (err) {
      console.error('Run failed', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      loadWorkflows();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleToggle = async (wf) => {
    try {
      await api.put(`/workflows/${wf.id}`, { status: wf.status === 'active' ? 'paused' : 'active' });
      loadWorkflows();
    } catch (err) {
      console.error('Toggle failed', err);
    }
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
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Automation Workflows</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Build automated rules for incoming WhatsApp messages.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {}}>
              <Zap className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button variant="primary" size="sm" onClick={() => { setEditing(null); setForm({ name: '', description: '', status: 'draft', trigger: 'incoming_message', triggerConfig: {}, actions: [] }); setOpenForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Workflow
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {workflows.length === 0 ? (
          <EmptyState
            type="default"
            title="No workflows yet"
            subtitle="Create your first automation workflow to handle incoming messages automatically."
            actionLabel="Create Workflow"
            onAction={() => { setEditing(null); setForm({ name: '', description: '', status: 'draft', trigger: 'incoming_message', triggerConfig: {}, actions: [] }); setOpenForm(true); }}
          />
        ) : (
          <div className="space-y-3">
            {workflows.map((wf) => (
              <Card key={wf.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold">
                      {wf.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : wf.status === 'paused' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">{wf.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{wf.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={wf.status === 'active' ? 'success' : wf.status === 'paused' ? 'warning' : 'secondary'} className="h-6 text-xs">
                      {wf.status.charAt(0).toUpperCase() + wf.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="h-6 text-xs">
                      {triggerLabel(wf.trigger)}
                    </Badge>
                    <span className="text-xs text-slate-400">{wf.runCount} runs</span>
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(wf)}>
                      {wf.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRun(wf.id)} title="Run now">
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(wf.id); setForm({ ...wf, triggerConfig: wf.triggerConfig || {}, actions: wf.actions || [] }); setOpenForm(true); }} title="Edit">
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(wf.id)} title="Delete">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      Last run: {wf.lastRunAt ? new Date(wf.lastRunAt).toLocaleString() : 'Never'}
                    </span>
                    <span className="flex items-center gap-1">
                      <BotIcon className="w-3 h-3" />
                      Actions: {wf.actions?.length || 0}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Workflow Builder Modal */}
        {openForm && (
          <>
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setOpenForm(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editing ? 'Edit Workflow' : 'Create Workflow'}</h2>
                    <Button variant="ghost" size="sm" onClick={() => setOpenForm(false)}>
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Workflow Name</label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Auto-reply to pricing" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none">
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                      <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this workflow do?" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trigger</label>
                      <select value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none">
                        {TRIGGERS.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      {form.trigger === 'keyword' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Keywords (comma-separated)</label>
                          <Input value={String(form.triggerConfig.keywords || '')} onChange={(e) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })} placeholder="price, cost, rate" />
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Actions</label>
                      <div className="space-y-2">
                        {form.actions.map((action, i) => (
                          <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                            <select value={action.type || ''} onChange={(e) => { const a = [...form.actions]; a[i].type = e.target.value; setForm({ ...form, actions: a }); }} className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none text-sm">
                              <option value="">Select action</option>
                              {ACTIONS.map((a) => (
                                <option key={a.value} value={a.value}>{a.label}</option>
                              ))}
                            </select>
                            {action.type === 'send_message' && (
                              <Input value={action.content || ''} onChange={(e) => { const a = [...form.actions]; a[i].content = e.target.value; setForm({ ...form, actions: a }); }} placeholder="Message content" className="flex-1" />
                            )}
                            <Button variant="ghost" size="sm" onClick={() => { const a = [...form.actions]; a.splice(i, 1); setForm({ ...form, actions: a }); }} className="p-1">
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" type="button" onClick={() => setForm({ ...form, actions: [...form.actions, {}] })}>
                          <Plus className="w-3 h-3 mr-1.5" />
                          Add Action
                        </Button>
                      </div>
                    </div>
                  <div className="mt-8 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setOpenForm(false)}>Cancel</Button>
                    <Button variant="primary" type="submit">{editing ? 'Update Workflow' : 'Create Workflow'}</Button>
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


