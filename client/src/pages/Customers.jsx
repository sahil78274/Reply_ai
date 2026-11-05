import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  Users,
  Phone,
  Tag,
  Clock,
  Download,
  Phone as PhoneIcon,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Card } from '../components/ui/Card.jsx';
import { initials, formatDate } from '../lib/utils.js';

const LEAD_STATUSES = ['New', 'Interested', 'Converted', 'Not Interested'];

const LEAD_BADGE_VARIANT = {
  New: 'secondary',
  Interested: 'default',
  Converted: 'success',
  'Not Interested': 'danger',
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleUpdate = async (id, updates) => {
    try {
      await api.put(`/customers/${id}`, updates);
      loadCustomers();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
        <Users className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Customers</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your WhatsApp contacts, lead status and notes.
            </p>
          </div>
          <Button variant="primary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Customer</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Phone</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Lead status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tags</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Last activity</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Unread</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                    No customers yet. Conversations appear here once you receive messages.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold">
                          {c.source === 'demo' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'}
                          {initials(c.name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{c.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={c.leadStatus}
                        onChange={(e) => handleUpdate(c.id, { leadStatus: e.target.value })}
                        className="bg-transparent text-sm text-slate-900 dark:text-white outline-none border-none focus:ring-0"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <Badge className="mt-1 inline-block" variant={LEAD_BADGE_VARIANT[c.leadStatus] || 'secondary'}>{c.leadStatus}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        {(c.tags || []).slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                        {(c.tags || []).length > 3 && <span className="text-xs text-slate-400">+{(c.tags.length - 3)}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {formatDate(c.lastMessageAt)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {c.unreadCount > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-red-500 text-white px-2 py-0.5 text-xs">
                          {c.unreadCount}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-xs text-slate-400 dark:text-slate-500">
          Lead statuses can also be updated from the inbox customer details panel.
        </div>
      </div>
    </div>
  );
}

function apiBase() {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
}
