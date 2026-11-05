import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  FileText,
  Plus,
  Trash2,
  Settings as SettingsIcon,
  Phone,
  Globe,
  ShoppingCart,
  HelpCircle,
  Search,
  Upload,
  Cloud,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Card } from '../components/ui/Card.jsx';
import { cn } from '../lib/utils.js';

export default function Knowledge() {
  const [knowledge, setKnowledge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const [form, setForm] = useState({
    businessName: '',
    businessDescription: '',
    productsAndServices: [{ name: '', description: '', price: '' }],
    pricing: [{ item: '', price: '', details: '' }],
    businessTimings: '',
    faqs: [{ question: '', answer: '' }],
    contactInformation: '',
  });

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const data = await api.get('/knowledge');
      if (data.knowledge) {
        setForm({
          businessName: data.knowledge.businessName || '',
          businessDescription: data.knowledge.businessDescription || '',
          productsAndServices: data.knowledge.productsAndServices?.length
            ? data.knowledge.productsAndServices
            : [{ name: '', description: '', price: '' }],
          pricing: data.knowledge.pricing?.length
            ? data.knowledge.pricing
            : [{ item: '', price: '', details: '' }],
          businessTimings: data.knowledge.businessTimings || '',
          faqs: data.knowledge.faqs?.length ? data.knowledge.faqs : [{ question: '', answer: '' }],
          contactInformation: data.knowledge.contactInformation || '',
        });
      }
    } catch (err) {
      console.error('Failed to load knowledge base', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (key) => {
    setForm((prev) => {
      const empty =
        key === 'productsAndServices'
          ? { name: '', description: '', price: '' }
          : key === 'pricing'
            ? { item: '', price: '', details: '' }
            : { question: '', answer: '' };
      return { ...prev, [key]: [...prev[key], empty] };
    });
  };

  const removeItem = (key, index) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const updateField = (key, index, field, value) => {
    setForm((prev) => {
      const arr = [...prev[key]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [key]: arr };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/knowledge', form);
      setMessage({ type: 'success', text: 'Knowledge base saved. AI will use this when replying.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.data?.error || 'Failed to save knowledge base' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      // Simulated upload - in production, this would POST to an upload endpoint
      await new Promise((r) => setTimeout(r, 1500));
      setMessage({
        type: 'success',
        text: `Document "${file.name}" uploaded and indexed for AI knowledge.`,
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload document' });
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const faqs = knowledge?.faqs || form.faqs || [];
  const filteredFaqs = searchQuery
    ? faqs.filter((f) => f.question.toLowerCase().includes(searchQuery.toLowerCase()) || f.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqs;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
        <FileText className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">AI Knowledge Base</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Teach ReplyAI about your business so it can answer customers accurately. Never invent prices or policies.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {message && (
          <div className="mb-4 rounded-lg p-3 text-sm">
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Document Upload */}
          <Card className="lg:col-span-1">
            <CardBody className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Documents</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Upload PDFs, documents, or website content for the AI to learn from.
              </p>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center hover:border-brand-500 dark:hover:border-brand-500 transition-colors">
                <Cloud className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Click to upload</p>
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="block w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/30 dark:file:text-brand-400"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                Supported: PDF, TXT, DOC, DOCX (max 10MB)
              </p>
            </CardBody>
          </Card>

          {/* AI Knowledge Search */}
          <Card className="lg:col-span-2">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">AI Knowledge Search</h3>
                </div>
                <Badge variant="outline">Demo mode</Badge>
              </div>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Ask the AI about your business…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-2">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                    <p>No knowledge items found</p>
                    {searchQuery && <p className="text-xs mt-1">Try a different search term</p>}
                  </div>
                ) : (
                  filteredFaqs.map((f, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{f.question}</span>
                        <Badge variant="outline" className="h-5 text-xs">FAQ</Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{f.answer}</p>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Business name</label>
              <Input
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="e.g. FabIndia Cotton"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Business timings</label>
              <Input
                value={form.businessTimings}
                onChange={(e) => setForm({ ...form, businessTimings: e.target.value })}
                placeholder="e.g. Mon–Sat 10:00 AM – 8:00 PM"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact information</label>
              <Input
                value={form.contactInformation}
                onChange={(e) => setForm({ ...form, contactInformation: e.target.value })}
                placeholder="e.g. +91 98765 43210, support@fabindia.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Business description</label>
            <textarea
              value={form.businessDescription}
              onChange={(e) => setForm({ ...form, businessDescription: e.target.value })}
              rows={3}
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="What does your business do? Who are your customers?"
            />
          </div>

          <ListSection
            key="products"
            title="Products & services"
            icon={<ShoppingCart className="w-4 h-4" />}
            items={form.productsAndServices}
            fields={['name', 'description', 'price']}
            placeholders={['Product name', 'Description', 'Price']}
            onChange={(index, field, value) => updateField('productsAndServices', index, field, value)}
            onAdd={() => addItem('productsAndServices')}
            onRemove={(index) => removeItem('productsAndServices', index)}
          />

          <ListSection
            key="pricing"
            title="Pricing"
            icon={<Globe className="w-4 h-4" />}
            items={form.pricing}
            fields={['item', 'price', 'details']}
            placeholders={['Item', 'Price', 'Details']}
            onChange={(index, field, value) => updateField('pricing', index, field, value)}
            onAdd={() => addItem('pricing')}
            onRemove={(index) => removeItem('pricing', index)}
          />

          <ListSection
            key="faqs"
            title="Frequently asked questions (FAQs)"
            icon={<HelpCircle className="w-4 h-4" />}
            items={form.faqs}
            fields={['question', 'answer']}
            placeholders={['Question', 'Answer']}
            onChange={(index, field, value) => updateField('faqs', index, field, value)}
            onAdd={() => addItem('faqs')}
            onRemove={(index) => removeItem('faqs', index)}
          />

          <div className="pt-4">
            <Button variant="primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save knowledge base'}
            </Button>
          </div>
        </form>

        <div className="mt-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">How the AI uses this</h3>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-5">
            <li>The AI answers questions using only the information above.</li>
            <li>If a customer asks something not in the knowledge base, the AI offers to forward it to you.</li>
            <li>Prices and policies above are used verbatim — the AI will never invent them.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ListSection({ title, icon, items, fields, placeholders, onChange, onAdd, onRemove }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        {icon}
        <span className="text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
      </div>
      <div className="p-4 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-4 items-end">
            {fields.map((field, fi) => (
              <div key={field} className="space-y-1">
                <Input
                  value={item[field] || ''}
                  onChange={(e) => onChange(i, field, e.target.value)}
                  placeholder={placeholders[fi]}
                />
              </div>
            ))}
            <div className="flex items-end">
              <Button
                variant="danger"
                size="sm"
                onClick={() => onRemove(i)}
                className="h-10"
                disabled={items.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="w-3 h-3 mr-1.5" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}

