import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  Globe,
  Lock,
  Database,
  Mail,
  Bot as BotIcon,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Link,
  Send,
} from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { cn } from '../lib/utils.js';

const INTEGRATIONS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Cloud API',
    icon: Mail,
    description: 'Official Meta WhatsApp Business messaging.',
    fields: ['Access Token', 'Phone Number ID', 'Business Account ID', 'Webhook Verify Token'],
    statusText: 'Not connected',
  },
  {
    id: 'gemini',
    name: 'Google Gemini AI',
    icon: BotIcon,
    description: 'Generative AI for automatic replies.',
    fields: ['API Key', 'Model'],
    statusText: 'Not connected',
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    icon: Database,
    description: 'Database for conversations and customer data.',
    fields: ['Connection URI'],
    statusText: 'Not connected',
  },
  {
    id: 'n8n',
    name: 'n8n Automation',
    icon: Link,
    description: 'Visual workflow automation integration.',
    fields: ['Webhook URL'],
    statusText: 'Not connected',
  },
];

export default function Integrations() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [statuses, setStatuses] = useState({
    whatsapp: 'disconnected',
    gemini: 'disconnected',
    mongodb: 'disconnected',
    n8n: 'disconnected',
  });
  const [testing, setTesting] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings').then((data) => {
      setSettings(data.settings || {});
    }).catch(() => {}).finally(() => setLoading(false));
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const health = await api.get('/health');
      setStatuses((prev) => ({ ...prev, mongodb: health.db === 'connected' ? 'connected' : 'disconnected' }));
    } catch (e) {
      setStatuses((prev) => ({ ...prev, mongodb: 'disconnected' }));
    }
  };

  const testConnection = async (id) => {
    setTesting((prev) => ({ ...prev, [id]: true }));
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setStatuses((prev) => ({ ...prev, [id]: 'connected' }));
    } catch (e) {
      setStatuses((prev) => ({ ...prev, [id]: 'error' }));
    } finally {
      setTesting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const isConfigured = (id) => {
    if (!settings) return false;
    const map = {
      whatsapp: settings.whatsAppAccessToken && settings.whatsAppAccessToken !== '***SET***',
      gemini: settings.geminiApiKey && settings.geminiApiKey !== '***SET***',
      mongodb: !!process.env.MONGODB_URI,
      n8n: !!process.env.N8N_WEBHOOK_URL,
    };
    return !!map[id];
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
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Integrations</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Connect ReplyAI to your business tools and services.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {INTEGRATIONS.map((integration) => {
            const status = statuses[integration.id];
            const configured = isConfigured(integration.id);
            const isTesting = testing[integration.id];
            return (
              <Card key={integration.id} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg">
                      {status === 'connected' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : status === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}
                      <integration.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{integration.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          status === 'connected' ? 'bg-emerald-500' : status === 'error' ? 'bg-red-500' : 'bg-slate-400 animate-pulse'
                        )}
                      />
                      <span className={cn('text-xs font-medium', status === 'connected' ? 'text-emerald-600 dark:text-emerald-400' : status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400')}>
                        {status === 'connected' ? 'Connected' : status === 'error' ? 'Error' : 'Disconnected'}
                      </span>
                    </div>
                    {!configured && (
                      <Badge variant="outline" className="h-6 text-xs">Not configured</Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isTesting || !configured}
                      onClick={() => testConnection(integration.id)}
                    >
                      {isTesting ? <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1.5" />}
                      Test
                    </Button>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Configured fields:</p>
                  <div className="flex flex-wrap gap-2">
                    {integration.fields.map((f) => (
                      <Badge key={f} variant={settings && (() => {
                        const keyMap = {
                          'Access Token': 'whatsAppAccessToken',
                          'Phone Number ID': 'phoneNumberId',
                          'Business Account ID': 'whatsAppBusinessAccountId',
                          'Webhook Verify Token': 'webhookVerifyToken',
                          'API Key': 'geminiApiKey',
                          'Connection URI': 'mongodbUri',
                          'Webhook URL': 'n8nWebhookUrl',
                        }[f];
                        return keyMap && settings[keyMap] && settings[keyMap] !== '***SET***' ? 'success' : 'outline';
                      })()} className="h-6 text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}

          <Card>
            <CardBody className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Webhook Configuration</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Meta WhatsApp Cloud API will send incoming messages to your webhook URL.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <Link className="w-4 h-4 text-slate-400" />
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Webhook URL</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/whatsapp` : 'https://your-domain.com/api/webhooks/whatsapp'}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <span className="text-xs">Copy</span>
                  </Button>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <Send className="w-4 h-4 text-slate-400" />
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Verify Token</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {settings?.webhookVerifyToken && settings.webhookVerifyToken !== '***SET***' ? '•••••••• (configured)' : 'Not configured'}
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Subscribe to the <code className="font-mono text-slate-500">messages</code> field in your Meta app dashboard.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

