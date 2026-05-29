import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LinkRow({ link, onCopy, onShowQR, onToggle, onDelete }) {
  function copy() {
    navigator.clipboard.writeText(link.shortUrl);
    toast.success('Copied!');
    onCopy?.(link);
  }

  const status = link.expired
    ? { label: 'Expired', className: 'badge-amber' }
    : link.isActive
    ? { label: 'Active', className: 'badge-green' }
    : { label: 'Disabled', className: 'badge-red' };

  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <td className="px-3 py-4">
        <div className="font-semibold">{link.title || link.shortCode}</div>
        <a
          href={link.originalUrl}
          target="_blank"
          rel="noreferrer"
          className="block max-w-xs truncate text-xs text-slate-500 hover:underline dark:text-slate-400"
        >
          {link.originalUrl}
        </a>
      </td>
      <td className="px-3 py-4">
        <a
          href={link.shortUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-mono text-brand-600 hover:underline dark:text-brand-300"
        >
          {link.shortUrl.replace(/^https?:\/\//, '')}
        </a>
      </td>
      <td className="px-3 py-4 text-sm">{link.clickCount}</td>
      <td className="px-3 py-4">
        <span className={status.className}>{status.label}</span>
      </td>
      <td className="px-3 py-4">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <button onClick={copy} className="btn-secondary !px-3 !py-1.5 text-xs">
            Copy
          </button>
          <button onClick={() => onShowQR(link)} className="btn-secondary !px-3 !py-1.5 text-xs">
            QR
          </button>
          <Link to={`/links/${link.id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
            Stats
          </Link>
          <button onClick={() => onToggle(link)} className="btn-secondary !px-3 !py-1.5 text-xs">
            {link.isActive ? 'Disable' : 'Enable'}
          </button>
          <button onClick={() => onDelete(link)} className="btn-danger !px-3 !py-1.5 text-xs">
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
