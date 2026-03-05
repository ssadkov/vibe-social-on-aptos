import { WalletSelector } from "./WalletSelector";

type HeaderProps = {
  targetInput: string;
  onTargetInputChange: (value: string) => void;
  onLoadTarget: () => void;
};

export function Header({
  targetInput,
  onTargetInputChange,
  onLoadTarget,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark px-4 sm:px-6 py-3 shrink-0">
      <div className="flex items-center gap-4 sm:gap-8 min-w-0">
        <div className="flex items-center gap-3 text-primary shrink-0">
          <div className="size-8 flex items-center justify-center rounded-lg bg-primary/10">
            <span className="material-symbols-outlined text-[20px]">database</span>
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em]">
            Object Vibe
          </h2>
        </div>
        <label className="flex flex-col min-w-0 flex-1 max-w-64">
          <div className="flex w-full items-stretch rounded-lg h-10 bg-slate-100 dark:bg-slate-800">
            <span className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-3 rounded-l-lg">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-transparent focus:outline-0 focus:ring-0 placeholder:text-slate-500 dark:placeholder:text-slate-400 px-3 pl-2 text-sm font-normal"
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
          className="shrink-0 px-4 py-2 h-10 rounded-lg bg-primary text-white font-semibold text-sm hover:brightness-110 transition"
        >
          Load
        </button>
      </div>
      <div className="flex flex-1 justify-end gap-2 sm:gap-4 items-center shrink-0 ml-2">
        <div className="h-8 w-px bg-slate-200 dark:border-slate-800 hidden sm:block" />
        <WalletSelector />
      </div>
    </header>
  );
}
