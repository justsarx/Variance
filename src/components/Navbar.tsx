import type { ExecutionMode } from '../types';

export type AppView = 'Paraphrase' | 'Chat';

interface NavbarProps {
  isBusy: boolean;
  executionMode?: ExecutionMode;
  apiProvider?: string;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
}

export function Navbar({ isBusy, executionMode, apiProvider, activeView, onViewChange }: NavbarProps) {
  const isExternal = executionMode === 'External';

  return (
    <nav className="h-14 bg-bg-primary border-b border-border-default flex items-center justify-between px-6 shrink-0">
      <div className="flex items-baseline gap-2">
        <h1 className="font-display font-semibold text-[18px] tracking-[0.08em] text-text-primary">Variance</h1>
        <span className="font-ui text-[10px] text-text-muted">v0.2</span>
      </div>
      <div className="flex items-center gap-2 p-1 rounded-full bg-bg-surface border border-border-default">
        {(['Paraphrase', 'Chat'] as AppView[]).map(view => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`px-3 py-1 rounded-full text-[11px] font-ui transition-all ${activeView === view ? 'bg-accent-glow text-accent-primary border border-[rgba(249,115,22,0.35)]' : 'text-text-muted hover:text-text-primary'}`}
          >
            {view}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bg-surface border border-border-default">
        <div className={`w-2 h-2 rounded-full ${isBusy ? 'bg-accent-primary' : (isExternal ? 'bg-amber-400' : 'bg-success animate-pulse')}`} />
        <span className="font-ui text-[11px] text-text-primary h-4 flex items-center">
          {isExternal ? `External · ${apiProvider}` : 'Local · No data sent'}
        </span>
      </div>
    </nav>
  );
}
