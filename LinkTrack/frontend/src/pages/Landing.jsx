import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </span>
          <span className="text-lg font-bold">LinkTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary">
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          Free • No credit card
        </span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-6xl">
          Short links.{' '}
          <span className="bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent">
            Real analytics.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 dark:text-slate-300 md:text-lg">
          Shorten any URL, share it anywhere, and track every click — browser, device, country,
          and time. Bring your custom aliases and QR codes too.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/register" className="btn-primary text-base">
            Create your first link
          </Link>
          <Link to="/login" className="btn-secondary text-base">
            I already have an account
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="card">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              {f.icon}
            </div>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Built with React, Express &amp; Prisma
      </footer>
    </div>
  );
}

const features = [
  {
    title: 'Custom short links',
    body: 'Pick your own alias or let us generate one. Optional expiry, one-click disable.',
    icon: <Icon path="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />,
  },
  {
    title: 'Click analytics',
    body: 'See total clicks, daily charts, top links, browsers, devices, and countries.',
    icon: <Icon path="M3 3v18h18 M7 14l4-4 4 4 5-6" />,
  },
  {
    title: 'QR codes',
    body: 'Every link gets a downloadable QR — perfect for posters, slides, and print.',
    icon: <Icon path="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h3v3h-3z M20 14v3 M14 20h3v1" />,
  },
];

function Icon({ path }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path.split(' M').map((d, i) => (
        <path key={i} d={(i === 0 ? '' : 'M') + d} />
      ))}
    </svg>
  );
}
