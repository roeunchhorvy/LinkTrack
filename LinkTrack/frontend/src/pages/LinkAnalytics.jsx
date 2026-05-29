import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

import api from '../api/axios';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import QRCodeModal from '../components/QRCodeModal';

Chart.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

const SHORT_BASE = import.meta.env.VITE_SHORT_URL_BASE || 'http://localhost:5000';

export default function LinkAnalytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    api
      .get(`/analytics/url/${id}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullscreen />;
  if (!data)
    return (
      <EmptyState
        title="Link not found"
        description="It may have been deleted."
        action={
          <Link to="/links" className="btn-primary mt-2">
            Back to links
          </Link>
        }
      />
    );

  const shortUrl = `${SHORT_BASE.replace(/\/$/, '')}/${data.url.shortCode}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/links"
            className="text-sm text-slate-500 hover:underline dark:text-slate-400"
          >
            ← Back to links
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{data.url.title || data.url.shortCode}</h1>
          <a
            href={data.url.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="block max-w-2xl truncate text-sm text-slate-500 hover:underline dark:text-slate-400"
          >
            {data.url.originalUrl}
          </a>
          <p className="mt-1 font-mono text-sm text-brand-600 dark:text-brand-300">{shortUrl}</p>
        </div>
        <button onClick={() => setQrOpen(true)} className="btn-secondary">
          Show QR
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total clicks" value={data.totalClicks} accent="brand"
          icon={<Icon path="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />} />
        <StatCard label="Unique browsers" value={data.browsers.length} accent="purple"
          icon={<Icon path="M3 12h18 M12 3v18 M5 5l14 14" />} />
        <StatCard label="Countries" value={data.countries.length} accent="green"
          icon={<Icon path="M3 6l9-3 9 3 M3 6v12l9 3 9-3V6 M12 3v18" />} />
      </div>

      <div className="card">
        <h2 className="mb-4 text-base font-semibold">Clicks over time</h2>
        {data.dailyClicks.length === 0 ? (
          <EmptyState title="No clicks yet" description="Share the link to start collecting data." />
        ) : (
          <DailyChart points={data.dailyClicks} />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <BreakdownCard title="Browsers" rows={data.browsers} />
        <BreakdownCard title="Devices" rows={data.devices} />
        <BreakdownCard title="Countries" rows={data.countries} />
      </div>

      <div className="card">
        <h2 className="mb-4 text-base font-semibold">Recent clicks</h2>
        {data.recent.length === 0 ? (
          <EmptyState title="No clicks yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">Browser</th>
                  <th className="px-3 py-2">Device</th>
                  <th className="px-3 py-2">Country</th>
                  <th className="px-3 py-2">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent.map((c) => (
                  <tr key={c.id}>
                    <td className="px-3 py-2">{new Date(c.clickedAt).toLocaleString()}</td>
                    <td className="px-3 py-2">{c.browser || '—'}</td>
                    <td className="px-3 py-2">{c.device || '—'}</td>
                    <td className="px-3 py-2">{c.country || '—'}</td>
                    <td className="px-3 py-2 font-mono text-xs">{c.ipAddress || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {qrOpen && <QRCodeModal url={shortUrl} onClose={() => setQrOpen(false)} />}
    </div>
  );
}

function DailyChart({ points }) {
  const sliced = points.slice(-30);
  return (
    <div className="h-64">
      <Line
        data={{
          labels: sliced.map((p) => p.date),
          datasets: [
            {
              label: 'Clicks',
              data: sliced.map((p) => p.count),
              borderColor: '#3669ff',
              backgroundColor: 'rgba(54, 105, 255, 0.15)',
              fill: true,
              tension: 0.35,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        }}
      />
    </div>
  );
}

function BreakdownCard({ title, rows }) {
  if (rows.length === 0) {
    return (
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">No data yet</p>
      </div>
    );
  }

  const palette = ['#3669ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
  const data = {
    labels: rows.slice(0, 7).map((r) => r.label),
    datasets: [
      {
        data: rows.slice(0, 7).map((r) => r.count),
        backgroundColor: palette,
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="h-40">
        <Doughnut
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
          }}
        />
      </div>
    </div>
  );
}

function Icon({ path }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path.split(' M').map((d, i) => (
        <path key={i} d={(i === 0 ? '' : 'M') + d} />
      ))}
    </svg>
  );
}
