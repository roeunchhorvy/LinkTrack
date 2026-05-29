import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import api from '../api/axios';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import LinkRow from '../components/LinkRow';
import QRCodeModal from '../components/QRCodeModal';

export default function LinkManagement() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [qrFor, setQrFor] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/urls');
      setLinks(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(link) {
    try {
      const { data } = await api.put(`/urls/${link.id}`, { isActive: !link.isActive });
      setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, ...data } : l)));
      toast.success(data.isActive ? 'Link enabled' : 'Link disabled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update');
    }
  }

  async function remove(link) {
    if (!window.confirm(`Delete "${link.title || link.shortCode}"?`)) return;
    try {
      await api.delete(`/urls/${link.id}`);
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
      toast.success('Link deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete');
    }
  }

  const filtered = links.filter((l) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      l.shortCode.toLowerCase().includes(q) ||
      l.originalUrl.toLowerCase().includes(q) ||
      (l.title || '').toLowerCase().includes(q)
    );
  });

  if (loading) return <Loader fullscreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My links</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage, edit, disable, or delete your short links.
          </p>
        </div>
        <Link to="/create" className="btn-primary">
          + New short link
        </Link>
      </div>

      <div className="card !p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, alias, or URL…"
          className="input"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={links.length === 0 ? 'No links yet' : 'No matches'}
          description={
            links.length === 0
              ? 'Create your first short link to get started.'
              : 'Try a different search term.'
          }
          action={
            links.length === 0 && (
              <Link to="/create" className="btn-primary mt-2">
                Create a link
              </Link>
            )
          }
        />
      ) : (
        <div className="card !p-0 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-3 py-3">Link</th>
                <th className="px-3 py-3">Short URL</th>
                <th className="px-3 py-3">Clicks</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((link) => (
                <LinkRow
                  key={link.id}
                  link={link}
                  onShowQR={(l) => setQrFor(l)}
                  onToggle={toggle}
                  onDelete={remove}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {qrFor && <QRCodeModal url={qrFor.shortUrl} onClose={() => setQrFor(null)} />}
      {editing && <EditModal link={editing} onClose={() => setEditing(null)} onSaved={load} />}
    </div>
  );
}

function EditModal({ link, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: link.title || '',
    customAlias: link.customAlias || '',
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.put(`/urls/${link.id}`, form);
      toast.success('Saved');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
      <div className="card w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">Edit link</h3>
        <div>
          <label className="label">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Custom alias</label>
          <input
            value={form.customAlias}
            onChange={(e) => setForm({ ...form, customAlias: e.target.value })}
            className="input"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
