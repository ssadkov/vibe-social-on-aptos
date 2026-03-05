import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Header } from "@/components/Header";
import { VibeFeed } from "@/components/VibeFeed";
import { useSelectedNetwork } from "@/hooks/useSelectedNetwork";

function App() {
  const { connected } = useWallet();
  const network = useSelectedNetwork();
  const [targetInput, setTargetInput] = useState("");
  const [targetObjAddress, setTargetObjAddress] = useState("");

  useEffect(() => {
    // Avoid mixing state between networks.
    setTargetInput("");
    setTargetObjAddress("");
  }, [network]);

  const handleLoadTarget = () => {
    const trimmed = targetInput.trim();
    if (trimmed) setTargetObjAddress(trimmed);
  };

  const handleTargetChange = (addr: string) => {
    setTargetInput(addr);
    setTargetObjAddress(addr);
  };

  if (!connected) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">
        <Header
          targetInput=""
          onTargetInputChange={() => {}}
          onLoadTarget={() => {}}
          network={network}
        />
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-8 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Connect a wallet to get started
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Use the button in the header to connect your Aptos wallet.
            </p>
          </div>
        </main>
        <footer className="h-8 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 flex items-center justify-end text-[10px] text-slate-500 font-mono tracking-tight shrink-0">
          <a
            href="https://x.com/ssadkov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-primary transition"
          >
            Vibecoded by @ssadkov
          </a>
        </footer>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      <Header
        targetInput={targetInput}
        onTargetInputChange={setTargetInput}
        onLoadTarget={handleLoadTarget}
        network={network}
      />
      <main className="flex flex-1 overflow-hidden">
        <VibeFeed
          targetObjAddress={targetObjAddress}
          onTargetChange={handleTargetChange}
        />
      </main>
      <footer className="h-8 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-tight shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
            Object Vibe
          </span>
        </div>
        <a
          href="https://x.com/ssadkov"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-primary transition"
        >
          Vibecoded by @ssadkov
        </a>
      </footer>
    </div>
  );
}

export default App;
