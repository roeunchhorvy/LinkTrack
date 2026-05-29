import { Link, useSearchParams } from 'react-router-dom';

const messages = {
  expired: {
    title: 'This link has expired',
    body: 'The owner set an expiry date and that date has passed.',
  },
  disabled: {
    title: 'This link is disabled',
    body: 'The owner has temporarily disabled this short link.',
  },
  'not-found': {
    title: 'Short link not found',
    body: 'We could not find a link matching that code.',
  },
};

export default function Expired() {
  const [params] = useSearchParams();
  const reason = params.get('reason') || 'not-found';
  const code = params.get('code');
  const m = messages[reason] || messages['not-found'];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <span className="badge-amber">Short link issue</span>
      <h1 className="mt-4 text-3xl font-bold">{m.title}</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{m.body}</p>
      {code && (
        <p className="mt-2 font-mono text-xs text-slate-400">/{code}</p>
      )}
      <Link to="/" className="btn-primary mt-6">
        Back to LinkTrack
      </Link>
    </div>
  );
}
