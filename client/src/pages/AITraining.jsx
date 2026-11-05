import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  SlidersHorizontal,
  Bot,
  Globe,
  Type,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { cn } from '../lib/utils.js';

export default function AITraining() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    aiLanguage: 'hinglish',
    aiPersonality: 'Friendly, helpful WhatsApp Business assistant',
    model: 'gemini-1.5-flash',
    temperature: 0.6,
    maxTokens: 250,
    responseDelay: 2,
  });
  const [responseLogs, setResponseLogs] = useState([
    { id: '1', customer: 'Rahul Sharma', query: 'What are your prices?', reply: 'Our pricing starts at ₹499. Would you like the full catalogue?', time: '10:23 AM', status: 'Delivered', rating: 5 },
    { id: '2', customer: 'Priya Mehta', query: 'Store location?', reply: '12 Brigade Road, Bengaluru - 560025.', time: '10:15 AM', status: 'Read', rating: 5 },
    { id: '3', customer: 'Amit Singh', query: 'Refund request', reply: 'I am forwarding this to our owner who will help you personally.', time: '09:45 AM', status: 'Escalated', rating: null },
    { id: '4', customer: 'Sneha Reddy', query: 'Discount available?', reply: 'We run seasonal discounts - shall I notify you when the next sale starts?', time: '09:30 AM', status: 'Read', rating: 4 },
    { id: '5', customer: 'Kabir Khan', query: 'Custom orders?', reply: '', time: '09:10 AM', status: 'Unanswered', rating: null },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings').then((data) => {
      if (data.settings) {
        setSettings((prev) => ({
          ...prev,
          aiLanguage: data.settings.aiLanguage || prev.aiLanguage,
          aiPersonality: data.settings.aiPersonality || prev.aiPersonality,
        }));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    api.put('/settings', {
      aiLanguage: settings.aiLanguage,
      aiPersonality: settings.aiPersonality,
    }).then(() => {
      // toast
    }).catch(() => {});
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">AI Training & Personality</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Fine-tune how ReplyAI speaks, which model it uses, and review its response history.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardBody className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">AI Language</h3>
              <select
                value={settings.aiLanguage}
                onChange={(e) => setSettings({ ...settings, aiLanguage: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="hinglish">Hinglish (Hindi + English)</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">AI Model</h3>
              <select
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Faster responses with Flash model.</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Temperature</h3>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-24 accent-brand-600"
                />
                <span className="text-sm font-mono text-slate-900 dark:text-white">{settings.temperature}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Lower = more deterministic. Higher = more creative.
              </p>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">System Personality</h3>
              <Badge variant="outline">Used in every AI response</Badge>
            </div>
            <textarea
              value={settings.aiPersonality}
              onChange={(e) => setSettings({ ...settings, aiPersonality: e.target.value })}
              rows={6}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm"
              placeholder="Describe your AI's personality..."
            />
            <div className="mt-4">
              <Button variant="primary" onClick={handleSave}>Save Personality</Button>
            </div>
          </CardBody>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardBody className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Response Delay</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Simulate human typing delay before AI replies (seconds).
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={settings.responseDelay}
                  onChange={(e) => setSettings({ ...settings, responseDelay: parseInt(e.target.value) })}
                  className="w-full accent-brand-600"
                />
                <span className="text-sm font-mono text-slate-900 dark:text-white">{settings.responseDelay}s</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Max Response Length</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Maximum tokens per AI response.
              </p>
              <Input
                type="number"
                value={settings.maxTokens}
                onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) || 250 })}
                className="w-32"
              />
            </CardBody>
          </Card>
        </div>

        {/* Response Logs */}
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-900 dark:text-white">AI Response Logs</h3>
              </div>
              <Badge variant={loading ? 'secondary' : 'success'} className="h-6">
                {loading ? 'Loading…' : 'Demo mode'}
              </Badge>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Customer Query</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">AI Response</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Time</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {responseLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{log.customer}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{log.query}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">{log.reply}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-right">{log.time}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={log.status === 'Escalated' ? 'danger' : log.status === 'Unanswered' ? 'warning' : 'success'} className="h-5 text-xs">
                          {log.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {log.rating ? (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={cn('w-3 h-3', star <= log.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-300')}>
                                <CheckCircle className="w-3 h-3" />
                              </span>
                            ))}
                            <span className="ml-1 text-xs text-slate-500">{log.rating}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
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

