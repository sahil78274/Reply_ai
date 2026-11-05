import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  Bot,
  ToggleLeft,
  ToggleRight,
  SlidersHorizontal,
  Globe,
  Type,
  AlertTriangle,
  Bot as BotIcon,
  UserRound,
  Activity,
  Clock,
} from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { cn } from '../lib/utils.js';

export default function AIAssistant() {
  const { user } = useAuth();
  const [globalAI, setGlobalAI] = useState(true);
  const [aiLanguage, setAiLanguage] = useState('hinglish');
  const [aiTone, setAiTone] = useState('Friendly');
  const [systemInstructions, setSystemInstructions] = useState(
    'You are a friendly, helpful WhatsApp Business assistant. Reply naturally in Hindi, English or Hinglish. Never invent prices or policies.'
  );
  const [escalationRules, setEscalationRules] = useState([
    'Complaints and refund requests',
    'Complex technical issues',
    'Pricing negotiations beyond standard rates',
  ]);
  const [perChatSettings, setPerChatSettings] = useState([
    { id: '1', customer: 'Rahul Sharma', phone: '+919876543210', ai: true, human: false, source: 'demo' },
    { id: '2', customer: 'Priya Mehta', phone: '+919123456789', ai: true, human: false, source: 'demo' },
    { id: '3', customer: 'Amit Singh', phone: '+919988776655', ai: false, human: true, source: 'demo' },
    { id: '4', customer: 'Sneha Reddy', phone: '+919001122334', ai: true, human: false, source: 'demo' },
    { id: '5', customer: 'Kabir Khan', phone: '+919334455667', ai: true, human: false, source: 'demo' },
  ]);
  const [responseLogs, setResponseLogs] = useState([
    { id: '1', customer: 'Rahul Sharma', query: 'What are your prices?', reply: 'Our pricing starts at ₹499.', time: '2 min ago', status: 'Delivered', ai: true },
    { id: '2', customer: 'Priya Mehta', query: 'Store location?', reply: '12 Brigade Road, Bengaluru.', time: '15 min ago', status: 'Read', ai: true },
    { id: '3', customer: 'Amit Singh', query: 'Refund request', reply: 'Escalated to owner.', time: '1 hour ago', status: 'Escalated', ai: false },
  ]);

  useEffect(() => {
    // Load settings from backend if available
    api.get('/settings').then((data) => {
      if (data.settings) {
        setAiLanguage(data.settings.aiLanguage || 'hinglish');
        setSystemInstructions(data.settings.aiPersonality || systemInstructions);
      }
    }).catch(() => {});
  }, []);

  const toneOptions = ['Friendly', 'Professional', 'Casual', 'Formal', 'Enthusiastic'];
  const languageOptions = [
    { value: 'hinglish', label: 'Hinglish (Hindi + English)' },
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    api.put('/settings', {
      aiLanguage,
      aiPersonality: systemInstructions,
    }).then(() => {
      // toast would go here
    }).catch(() => {});
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">AI Assistant</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure how ReplyAI responds to your WhatsApp customers.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Global AI Toggle */}
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Global AI Automation</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enable or disable AI replies across all conversations.
                </p>
              </div>
              <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-dark">
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-300 ${
                    globalAI ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
            </div>
            <div className="flex items-end gap-4">
              <Button variant={globalAI ? 'primary' : 'outline'} onClick={() => setGlobalAI(!globalAI)} size="sm">
                {globalAI ? 'AI is ON' : 'AI is OFF'}
              </Button>
              <Badge variant={globalAI ? 'success' : 'secondary'} className="h-6">
                {globalAI ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardBody>
        </Card>

        {/* AI Settings */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardBody className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Response Language</h3>
              <select
                value={aiLanguage}
                onChange={(e) => setAiLanguage(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                AI will match the customer's language when possible.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Reply Tone</h3>
              <div className="space-y-2">
                {toneOptions.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setAiTone(tone)}
                    className={cn(
                      'w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors',
                      aiTone === tone
                        ? 'border-brand-600 dark:border-brand-400 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    )}
                  >
                    {tone}
                    {aiTone === tone && <span className="text-xs">Active</span>}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="lg:col-span-3">
            <CardBody className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Custom System Instructions</h3>
              <textarea
                value={systemInstructions}
                onChange={(e) => setSystemInstructions(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm"
                placeholder="Custom instructions for the AI..."
              />
              <Button variant="primary" onClick={handleSave} className="mt-4">
                Save Instructions
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Escalation Rules */}
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Escalation Rules</h3>
              <Badge variant="outline">AI hands off to human</Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              When a customer query matches these rules, AI stops and alerts the owner.
            </p>
            <div className="space-y-2">
              {escalationRules.map((rule, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{rule}</span>
                  <Button variant="ghost" size="sm" className="h-8 p-1" onClick={() => {}}>
                    <AlertTriangle className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <div className="mt-2">
                <Input placeholder="Add new escalation rule..." className="max-w-xs" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Per-Chat AI Controls */}
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Per-Conversation AI Controls</h3>
              <Badge variant="outline">Demo data</Badge>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Phone</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">AI Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {perChatSettings.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{c.customer}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{c.phone}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <span
                            className={cn(
                              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                              c.ai ? 'border-brand-600' : 'border-slate-300 dark:border-slate-600',
                              c.ai ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
                            )}
                            onClick={() => {
                              const idx = perChatSettings.findIndex((x) => x.id === c.id);
                              const next = [...perChatSettings];
                              next[idx].ai = !next[idx].ai;
                              next[idx].human = !next[idx].ai;
                              setPerChatSettings(next);
                            }}
                          >
                            <span
                              className={cn(
                                'inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-300',
                                c.ai ? 'translate-x-5' : 'translate-x-1'
                              )}
                            />
                          </span>
                          <span className={cn('text-xs font-medium', c.ai ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500')}>
                            {c.ai ? 'AI ON' : 'AI OFF'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={c.source === 'demo' ? 'outline' : 'success'} className="h-6 text-xs">
                          {c.source === 'demo' ? 'Demo' : 'Live'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* AI Response Logs */}
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">AI Response Logs</h3>
              <Badge variant="secondary">Demo mode</Badge>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Query</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">AI Reply</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Time</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Handled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {responseLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{log.customer}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{log.query}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{log.reply}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{log.time}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={log.status === 'Escalated' ? 'danger' : log.status === 'Read' ? 'success' : 'secondary'} className="h-5 text-xs">
                          {log.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {log.ai ? (
                          <Badge variant="secondary" className="h-5 text-xs">AI</Badge>
                        ) : (
                          <Badge variant="outline" className="h-5 text-xs">Human</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

