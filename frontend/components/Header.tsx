import { WalletSelector } from "./WalletSelector";
import type { AppNetwork } from "@/constants";
import { setSelectedNetwork } from "@/state/network";

type HeaderProps = {
  targetInput: string;
  onTargetInputChange: (value: string) => void;
  onLoadTarget: () => void;
  network: AppNetwork;
};

export function Header({
  targetInput,
  onTargetInputChange,
  onLoadTarget,
  network,
}: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark px-3 sm:px-6 py-2 sm:py-3 shrink-0">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 text-primary shrink-0">
          <div className="size-7 sm:size-8 flex items-center justify-center rounded-lg bg-primary/10">
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">database</span>
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-base sm:text-lg font-bold leading-tight tracking-[-0.015em]">
            Object Vibe
          </h2>
        </div>
        <div className="sm:hidden flex items-center gap-2">
          <select
            value={network}
            onChange={(e) => setSelectedNetwork(e.target.value as AppNetwork)}
            className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold px-2 outline-none border border-slate-200/70 dark:border-slate-700 focus:border-primary/60"
            aria-label="Network"
            title="Network"
          >
            <option value="devnet">devnet</option>
            <option value="testnet">testnet</option>
            <option value="mainnet">mainnet</option>
          </select>
          <WalletSelector />
        </div>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <label className="flex flex-col min-w-0 flex-1 sm:max-w-64">
          <div className="flex w-full items-stretch rounded-lg h-9 sm:h-10 bg-slate-100 dark:bg-slate-800">
            <span className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-2 sm:pl-3 rounded-l-lg">
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">search</span>
            </span>
            <input
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-transparent focus:outline-0 focus:ring-0 placeholder:text-slate-500 dark:placeholder:text-slate-400 px-2 sm:px-3 pl-1 sm:pl-2 text-sm font-normal"
              placeholder="Search objects..."
              value={targetInput}
              onChange={(e) => onTargetInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onLoadTarget()}
            />
          </div>
        </label>
        <button
          type="button"
          onClick={onLoadTarget}
          className="shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 h-9 sm:h-10 rounded-lg bg-primary text-white font-semibold text-xs sm:text-sm hover:brightness-110 transition"
        >
          Load
        </button>
      </div>
      <div className="hidden sm:flex flex-1 justify-end gap-2 sm:gap-4 items-center shrink-0 ml-2">
        <div className="h-8 w-px bg-slate-200 dark:border-slate-800" />
        <label className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-tight">
            Network
          </span>
          <select
            value={network}
            onChange={(e) => setSelectedNetwork(e.target.value as AppNetwork)}
            className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 outline-none border border-slate-200/70 dark:border-slate-700 focus:border-primary/60"
          >
            <option value="devnet">devnet</option>
            <option value="testnet">testnet</option>
            <option value="mainnet">mainnet</option>
          </select>
        </label>
        <WalletSelector />
      </div>
    </header>
  );
}
