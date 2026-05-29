export default function Loader({ fullscreen = false, label = 'Loading…' }) {
  const spinner = (
    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );

  if (!fullscreen) return spinner;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">{spinner}</div>
  );
}
