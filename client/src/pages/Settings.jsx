import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  Lock,
  Phone,
  Send,
  Bot,
  Bell,
  Settings as SettingsIcon,
  ShieldAlert,
  Globe,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.get('/settings');
      setSettings(data.settings || {});
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...settings };
      if (!payload.geminiApiKey || payload.geminiApiKey === '***SET***') delete payload.geminiApiKey;
      if (!payload.whatsAppAccessToken || payload.whatsAppAccessToken === '***SET***') delete payload.whatsAppAccessToken;
      if (!payload.webhookVerifyToken || payload.webhookVerifyToken === '***SET***') delete payload.webhookVerifyToken;
      const data = await api.put('/settings', payload);
      setSettings(data.settings || settings);
      setMessage({ type: 'success', text: 'Settings saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.data?.error || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const toggleShow = (key) => {
    setShowSecrets({ ...showSecrets, [key]: !showSecrets[key] });
  };

  const mask = (v) => (v && v !== '***SET***' ? '••••••••' : '');

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
        <SettingsIcon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Connect your AI and WhatsApp credentials. Sensitive values are stored only on the backend.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {message && (
          <div className="rounded-lg p-3 text-sm">
            {message.type === 'success'
              ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
                  {message.text}
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                  {message.text}
                </div>
              )}
          </div>
        )}

        <Card>
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> API credentials
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter your Google Gemini API key and Meta WhatsApp Cloud API credentials.
            </p>
          </div>
          <div className="p-5 space-y-4">
            <SecretField
              label="Gemini API key"
              icon={<Lock className="w-4 h-4" />}
              value={settings.geminiApiKey || ''}
              masked={settings.geminiApiKey === '***SET***' || !settings.geminiApiKey}
              onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
              onToggleShow={() => toggleShow('geminiApiKey')}
              shown={showSecrets.geminiApiKey}
              placeholder="AIzaSy…"
            />
            <SecretField
              label="WhatsApp access token"
              icon={<Phone className="w-4 h-4" />}
              value={settings.whatsAppAccessToken || ''}
              masked={settings.whatsAppAccessToken === '***SET***' || !settings.whatsAppAccessToken}
              onChange={(e) => setSettings({ ...settings, whatsAppAccessToken: e.target.value })}
              onToggleShow={() => toggleShow('whatsAppAccessToken')}
              shown={showSecrets.whatsAppAccessToken}
              placeholder="EAAG…"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Phone Number ID"
                icon={<Send className="w-4 h-4" />}
                value={settings.phoneNumberId || ''}
                onChange={(e) => setSettings({ ...settings, phoneNumberId: e.target.value })}
                placeholder="1029384756…"
              />
              <InputField
                label="WhatsApp Business Account ID"
                icon={<Globe className="w-4 h-4" />}
                value={settings.whatsAppBusinessAccountId || ''}
                onChange={(e) => setSettings({ ...settings, whatsAppBusinessAccountId: e.target.value })}
                placeholder="WABA ID…"
              />
            </div>
            <InputField
              label="Webhook verify token"
              icon={<ShieldAlert className="w-4 h-4" />}
              value={settings.webhookVerifyToken || ''}
              masked={settings.webhookVerifyToken === '***SET***' || !settings.webhookVerifyToken}
              onChange={(e) => setSettings({ ...settings, webhookVerifyToken: e.target.value })}
              onToggleShow={() => toggleShow('webhookVerifyToken')}
              shown={showSecrets.webhookVerifyToken}
              placeholder="replyai_verify_token"
              helper="Meta will call your webhook GET /api/webhooks/whatsapp with this token."
            />
          </div>
        </Card>

        <Card>
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="w-4 h-4" /> AI behavior
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure how ReplyAI speaks to your customers.
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">AI language</label>
              <select
                value={settings.aiLanguage || 'hinglish'}
                onChange={(e) => setSettings({ ...settings, aiLanguage: e.target.value })}
                className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="hinglish">Hinglish (Hindi + English mix)</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">AI personality</label>
              <textarea
                value={settings.aiPersonality || ''}
                onChange={(e) => setSettings({ ...settings, aiPersonality: e.target.value })}
                rows={3}
                className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Friendly, helpful, professional…"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifications
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Instant alerts on the dashboard for new messages and enquiries.
            </p>
          </div>
          <div className="p-5 space-y-3">
            <ToggleRow
              label="New message notifications"
              description="Get notified when a customer messages you"
              checked={settings.notifyNewMessage !== false}
              onChange={(checked) => setSettings({ ...settings, notifyNewMessage: checked })}
            />
            <ToggleRow
              label="New customer enquiry alerts"
              description="Alert when a first-time customer starts a conversation"
              checked={settings.notifyNewEnquiry !== false}
              onChange={(checked) => setSettings({ ...settings, notifyNewEnquiry: checked })}
            />
            <ToggleRow
              label="Unanswered conversation alerts"
              description="Remind you about conversations waiting for a reply"
              checked={settings.notifyUnanswered !== false}
              onChange={(checked) => setSettings({ ...settings, notifyUnanswered: checked })}
            />
            <ToggleRow
              label="Sound notifications"
              description="Play a subtle sound on new messages"
              checked={settings.soundEnabled !== false}
              onChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
            />
          </div>
        </Card>

        <Card>
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4" /> Demo mode
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              When enabled, sample data is used so you can explore ReplyAI without a real WhatsApp connection.
            </p>
          </div>
          <div className="p-5">
            <ToggleRow
              label="Demo mode"
              description="Shows sample conversations marked as Demo"
              checked={settings.demoMode !== false}
              onChange={(checked) => setSettings({ ...settings, demoMode: checked })}
            />
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Demo conversations are clearly labeled and cannot be mixed with real WhatsApp messages.
            </div>
          </div>
        </Card>

        <div className="pt-4">
          <Button variant="primary" disabled={saving} onClick={handleSubmit}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SecretField({ label, icon, value, masked, onChange, onToggleShow, shown, placeholder, helper }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleShow}>
          {shown ? 'Hide' : 'Show'}
        </Button>
      </div>
      <Input
        type={shown ? 'text' : 'password'}
        value={masked ? '' : value}
        onChange={onChange}
        placeholder={masked ? '•••••••• (stored)' : placeholder}
        className="pr-10"
      />
      {helper && <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p>}
    </div>
  );
}

function InputField({ label, icon, value, onChange, placeholder, helper }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      </div>
      <Input value={value} onChange={onChange} placeholder={placeholder} />
      {helper && <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p>}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3">
      <div>
        <div className="text-sm font-medium text-slate-900 dark:text-white">{label}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{description}</div>
      </div>
      <button
        onChange={undefined}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        aria-checked={checked}
        role="switch"
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}
