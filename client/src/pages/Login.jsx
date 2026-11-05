import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Bot, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { api } from '../services/api.js';
import { cn } from '../lib/utils.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'demo@replyai.com', password: 'demo1234' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.post('/auth/login', form);
login(data.token, data.user);
navigate('/');
    } catch (err) {
      setError(err.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const data = await api.post('/auth/login', {
      email: 'demo@replyai.com',
      password: 'demo1234',
    });

    login(data.token, data.user);
    navigate('/');
  } catch (err) {
    setError(err.data?.error || err.message || 'Demo login failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardBody className="p-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
              RA
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">ReplyAI</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            WhatsApp Business AI Assistant — sign in to manage your conversations.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  className="pl-10"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@business.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  className="pl-10"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            <Button variant="primary" type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 text-center">
              No account? Try the demo:
            </p>
            <Button variant="outline" onClick={handleDemo} className="w-full" disabled={loading}>
              <Bot className="w-4 h-4 mr-2" />
              Load Demo Account (demo@replyai.com / demo1234)
            </Button>
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center">
              Demo mode works without any WhatsApp or Gemini configuration.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
