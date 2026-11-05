import { useState } from 'react';
import { Phone, Tag, Clock, Edit2, Bot as BotIcon, UserRound } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { initials } from '../../lib/utils.js';

const LEAD_STATUSES = ['New', 'Interested', 'Converted', 'Not Interested'];

export function CustomerDetail({ conversation, onUpdate }) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(conversation.notes || '');

  const leadColor = (s) => {
    switch (s) {
      case 'Converted': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'Interested': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'Not Interested': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="h-full flex flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-y-auto">
      <div className="flex items-center justify-between h-14 border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-950 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold">
            {conversation.source === 'demo'
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              : 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'}
            {initials(conversation.customerName)}
          </div>
          <div>
            <span className="text-sm font-medium text-slate-900 dark:text-white block">
              {conversation.customerName}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              {conversation.customerPhone}
            </span>
          </div>
        </div>
        <span className={cn('text-xs font-bold tracking-wider px-2 py-1 rounded-md', conversation.source === 'demo' ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800')}>
          {conversation.source === 'demo' ? 'DEMO' : 'LIVE'}
        </span>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Lead status</span>
            <select
              value={conversation.leadStatus}
              onChange={(e) => onUpdate({ leadStatus: e.target.value })}
              className="bg-transparent text-sm text-slate-900 dark:text-white outline-none"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s} className={leadColor(s)}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Tags</span>
            {(conversation.tags || []).map((tag) => (
              <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Notes</span>
              <Button variant="ghost" size="sm" onClick={() => setEditingNotes(true)} className="text-xs p-1">
                <Edit2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
              {notes || 'No notes yet.'}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 dark:text-slate-200 font-medium">{conversation.customerPhone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <UserRound className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 dark:text-slate-200 font-medium">{conversation.source === 'demo' ? 'Demo customer' : 'WhatsApp customer'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">
              Last activity: {new Date(conversation.lastMessageAt || conversation.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BotIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium">
              {conversation.humanTakeover ? 'AI paused (human takeover)' : conversation.aiEnabled ? 'AI replies ON' : 'AI replies OFF'}
            </span>
          </div>
        </div>
      </div>

      {editingNotes && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shrink-0">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none"
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setEditingNotes(false); setNotes(conversation.notes || ''); }}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => {
              setEditingNotes(false);
              onUpdate({ notes });
            }}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
