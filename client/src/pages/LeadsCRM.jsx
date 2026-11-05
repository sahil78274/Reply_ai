import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Users, Phone, Tag, Clock, Download, Upload, AlertCircle, TrendingUp, DollarSign, CheckCircle, Search, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { cn } from '../lib/utils.js';

const LEAD_STATUSES = ['New', 'Interested', 'Converted', 'Not Interested'];

export default function LeadsCRM() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', leadStatus: '', search: '' });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.get('/customers');
      setCustomers(data.customers || []);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  const leadScore = (c) => {
    let score = 0;
    if (c.leadStatus === 'Converted') score = 100;
    else if (c.leadStatus === 'Interested') score = 70;
    else if (c.leadStatus === 'New') score = 40;
    else score = 10;
    if ((c.unreadCount || 0) > 0) score += 10;
    if (score >= 80) return 'Hot';
    if (score >= 50) return 'Warm';
    return 'Cold';
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${apiBase()}/customers/export-csv`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('ra_token') || ''}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'replyai-leads.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const filtered = customers.filter((c) => {
    const q = filter.search.toLowerCase();
    const matchStatus = filter.status ? c.status === filter.status : true;
    const matchLead = filter.leadStatus ? c.leadStatus === filter.leadStatus : true;
    return matchStatus && matchLead && (c.name.toLowerCase().includes(q) || c.phone.includes(q));
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = {
    total: customers.length,
    new: customers.filter((c) => c.leadStatus === 'New').length,
    interested: customers.filter((c) => c.leadStatus === 'Interested').length,
    converted: customers.filter((c) => c.leadStatus === 'Converted').length,
    hot: customers.filter((c) => leadScore(c) === 'Hot').length,
  };

  const statItems = [
    { label: 'Total Leads', value: stats.total, icon: <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Hot Leads', value: stats.hot, icon: <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Interested', value: stats.interested, icon: <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'New', value: stats.new, icon: <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Converted', value: stats.converted, icon: <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Unread', value: customers.reduce((s, c) => s + (c.unreadCount || 0), 0), icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />, bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
        <AlertCircle className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Leads & CRM</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your customer pipeline, lead scoring, and follow-ups.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="primary" onClick={() => {}}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-6">
          {statItems.map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={cn('rounded-lg p-2', stat.bg)}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search customers…"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <select
            value={filter.leadStatus}
            onChange={(e) => setFilter({ ...filter, leadStatus: e.target.value })}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">All Lead Status</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Tag className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            type="leads"
            title="No leads found"
            subtitle="Try adjusting your filters or import customers."
            actionLabel="Import CSV"
            onAction={() => {}}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Customer</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Phone</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Lead Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Score</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tags</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Unread</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginated.map((c) => {
                  const score = leadScore(c);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold">
                            {c.source === 'demo' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'}
                            {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.name}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{c.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={c.leadStatus}
                          onChange={(e) => {
                            api.put(`/customers/${c.id}`, { leadStatus: e.target.value }).then(() => loadCustomers());
                          }}
                          className="bg-transparent text-sm text-slate-900 dark:text-white outline-none border-none focus:ring-0"
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold', score === 'Hot' ? 'text-emerald-600 dark:text-emerald-400' : score === 'Warm' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400')}>
                          {score}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          {(c.tags || []).slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                          {(c.tags || []).length > 2 && <span className="text-xs text-slate-400">+{(c.tags.length - 2)}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {c.unreadCount > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-red-500 text-white px-2 py-0.5 text-xs">{c.unreadCount}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-slate-600 dark:text-slate-300">{new Date(c.lastMessageAt || c.createdAt).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function apiBase() {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
}
