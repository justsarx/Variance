
interface ControlBarProps {
  varianceLevel: number;
  setVarianceLevel: (val: number) => void;
  onClear: () => void;
  onCopy: () => void;
  onTransform: () => void;
  isTransforming: boolean;
  copySuccess: boolean;
  disabled: boolean;
}

export function ControlBar({
  varianceLevel,
  setVarianceLevel,
  onClear,
  onCopy,
  onTransform,
  isTransforming,
  copySuccess,
  disabled
}: ControlBarProps) {
  return (
    <div className="h-[72px] w-full bg-bg-surface border-b border-border-default px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1 w-[220px]">
          <div className="flex items-center justify-between pointer-events-none mb-1">
             <span className="font-ui text-[11px] uppercase tracking-[0.12em] text-text-muted font-medium">VARIANCE</span>
             <span className="font-display text-[28px] font-medium text-accent-primary leading-none">{varianceLevel}</span>
          </div>
          <input 
            type="range" 
            min="0" max="100" 
            value={varianceLevel}
            onChange={(e) => setVarianceLevel(Number(e.target.value))}
            style={{ '--slider-bg': `linear-gradient(to right, #F97316 ${varianceLevel}%, #222222 ${varianceLevel}%)` } as any}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between font-ui text-[10px] text-text-muted mt-1">
            <span>Subtle</span>
            <span>Aggressive</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onClear}
          disabled={disabled}
          className="bg-transparent border border-border-default text-text-secondary font-ui text-[13px] font-medium py-[10px] px-4 rounded-[8px] hover:border-border-active hover:text-text-primary transition-all duration-150 disabled:opacity-50"
        >
          Clear
        </button>
        <button 
          onClick={onCopy}
          disabled={disabled}
          className="bg-transparent border border-border-default text-text-secondary font-ui text-[13px] font-medium py-[10px] px-4 rounded-[8px] hover:border-border-active hover:text-text-primary transition-all duration-150 disabled:opacity-50 w-[120px] flex justify-center"
        >
          {copySuccess ? '✓ Copied' : 'Copy Output'}
        </button>
        <button 
          onClick={onTransform}
          disabled={disabled}
          className="bg-[linear-gradient(135deg,#F97316_0%,#EA580C_100%)] text-white font-ui text-[13px] font-semibold uppercase tracking-[0.06em] py-[10px] px-5 rounded-[8px] shadow-[0_0_24px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isTransforming ? '...' : 'Transform →'}
        </button>
      </div>
    </div>
  );
}
