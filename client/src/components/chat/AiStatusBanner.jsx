import { Bot, UserRound, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function AiStatusBanner({ aiEnabled, humanTakeover, onTakeover, onResume }) {
  if (humanTakeover) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-amber-800 dark:text-amber-400">Human takeover active</div>
          <div className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
            AI is paused for this conversation. You are replying manually.
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onResume}>
          <UserRound className="w-3 h-3 mr-2" /> Resume AI
        </Button>
      </div>
    );
  }

  if (!aiEnabled) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 mb-4">
        <Bot className="w-5 h-5 text-slate-500" />
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">AI is OFF</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            AI will not send automatic replies in this conversation.
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={onResume}>
          Resume AI
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 mb-4">
      <Bot className="w-5 h-5 text-emerald-600" />
      <div className="flex-1">
        <div className="text-sm font-medium text-emerald-800 dark:text-emerald-400">AI automation ON</div>
        <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
          AI will reply automatically to new messages in this conversation.
        </div>
      </div>
      <Button variant="danger" size="sm" onClick={onTakeover}>
        Take Over
      </Button>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
