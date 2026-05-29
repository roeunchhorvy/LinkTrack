import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

import api from '../api/axios';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/analytics/summary')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullscreen />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Overview of your shortened links and click activity.
          </p>
        </div>
        <Link to="/create" className="btn-primary">
          + New short link
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total links"
          value={data.totalLinks}
          accent="brand"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          }
        />
        <StatCard
          label="Total clicks"
          value={data.totalClicks}
          accent="green"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          }
        />
        <StatCard
          label="Avg clicks / link"
          value={data.totalLinks ? (data.totalClicks / data.totalLinks).toFixed(1) : '0'}
          accent="purple"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 14l4-4 4 4 5-6" />
            </svg>
          }
        />
      </div>

      <div className="card">
        <h2 className="mb-4 text-base font-semibold">Daily clicks (last 30 days)</h2>
        {data.dailyClicks.length === 0 ? (
          <EmptyState
            title="No clicks yet"
            description="Share a short link to start collecting analytics."
          />
        ) : (
          <DailyChart points={data.dailyClicks} />
        )}
      </div>

      <div className="card">
        <h2 className="mb-4 text-base font-semibold">Top performing links</h2>
        {data.topLinks.length === 0 ? (
          <EmptyState
            title="No links yet"
            description="Create your first short link to see it here."
            action={
              <Link to="/create" className="btn-primary mt-2">
                Create a link
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.topLinks.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{l.title || l.shortCode}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    /{l.shortCode} — {l.originalUrl}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge-slate">{l.clickCount} clicks</span>
                  <Link to={`/links/${l.id}`} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DailyChart({ points }) {
  // Use last 30 days max
  const sliced = points.slice(-30);
  const chartData = {
    labels: sliced.map((p) => p.date),
    datasets: [
      {
        label: 'Clicks',
        data: sliced.map((p) => p.count),
        borderColor: '#3669ff',
        backgroundColor: 'rgba(54, 105, 255, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };
  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}
