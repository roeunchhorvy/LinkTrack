import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import api from '../api/axios';
import QRCodeModal from '../components/QRCodeModal';

export default function CreateLink() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    originalUrl: '',
    customAlias: '',
    title: '',
    expiresAt: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);

  function validate() {
    const e = {};
    try {
      // URL constructor throws on invalid URLs
      // eslint-disable-next-line no-new
      new URL(form.originalUrl);
    } catch {
      e.originalUrl = 'Enter a valid URL (include http:// or https://)';
    }
    if (form.customAlias && !/^[a-zA-Z0-9_-]{3,32}$/.test(form.customAlias)) {
      e.customAlias = '3-32 chars: letters, numbers, - or _';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        originalUrl: form.originalUrl,
        customAlias: form.customAlias || undefined,
        title: form.title || undefined,
        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : undefined,
      };
      const { data } = await api.post('/urls', payload);
      setCreated(data);
      toast.success('Short link created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create link');
    } finally {
      setLoading(false);
    }
  }

  function copyShort() {
    navigator.clipboard.writeText(created.shortUrl);
    toast.success('Copied to clipboard');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create a short link</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Paste a long URL, add an optional custom alias, and share.
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="label">Long URL *</label>
          <input
            type="url"
            value={form.originalUrl}
            onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
            placeholder="https://example.com/very/long/article-url"
            className="input"
          />
          {errors.originalUrl && <p className="mt-1 text-xs text-rose-500">{errors.originalUrl}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Title (optional)</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Marketing campaign"
              className="input"
            />
          </div>
          <div>
            <label className="label">Custom alias (optional)</label>
            <input
              value={form.customAlias}
              onChange={(e) => setForm({ ...form, customAlias: e.target.value })}
              placeholder="my-link"
              className="input"
            />
            {errors.customAlias && <p className="mt-1 text-xs text-rose-500">{errors.customAlias}</p>}
          </div>
        </div>

        <div>
          <label className="label">Expires at (optional)</label>
          <input
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            className="input"
          />
        </div>

        <button disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating…' : 'Create short link'}
        </button>
      </form>

      {created && (
        <div className="card space-y-4">
          <h2 className="text-base font-semibold">Your short link is ready</h2>
          <div className="rounded-lg bg-slate-100 p-3 font-mono text-sm dark:bg-slate-800">
            {created.shortUrl}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={copyShort} className="btn-primary">
              Copy link
            </button>
            <button onClick={() => setQrOpen(true)} className="btn-secondary">
              Show QR code
            </button>
            <button onClick={() => navigate(`/links/${created.id}`)} className="btn-secondary">
              View analytics
            </button>
            <button
              onClick={() => {
                setCreated(null);
                setForm({ originalUrl: '', customAlias: '', title: '', expiresAt: '' });
              }}
              className="btn-secondary"
            >
              Create another
            </button>
          </div>
        </div>
      )}

      {qrOpen && created && (
        <QRCodeModal url={created.shortUrl} onClose={() => setQrOpen(false)} />
      )}
    </div>
  );
}
