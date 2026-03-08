
export function Navbar({ isTransforming }: { isTransforming: boolean }) {
  return (
    <nav className="h-14 bg-bg-primary border-b border-border-default flex items-center justify-between px-6 shrink-0">
      <div className="flex items-baseline gap-2">
        <h1 className="font-display font-semibold text-[18px] tracking-[0.08em] text-text-primary">Variance</h1>
        <span className="font-ui text-[10px] text-text-muted">v0.1</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bg-surface border border-border-default">
        <div className={`w-2 h-2 rounded-full ${isTransforming ? 'bg-accent-primary' : 'bg-success animate-pulse'}`} />
        <span className="font-ui text-[11px] text-text-primary h-4 flex items-center">Local &middot; No data sent</span>
      </div>
    </nav>
  );
}
