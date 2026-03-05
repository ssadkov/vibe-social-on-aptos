import { useWallet } from "@aptos-labs/wallet-adapter-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useSelectedNetwork } from "@/hooks/useSelectedNetwork";
import { setSelectedNetwork } from "@/state/network";
import type { AppNetwork } from "@/constants";

export function WrongNetworkAlert() {
  const { network, connected } = useWallet();
  const selectedNetwork = useSelectedNetwork();
  const walletNetworkName = String(network?.name ?? "");
  const walletNetworkValid: AppNetwork | null =
    walletNetworkName === "mainnet" || walletNetworkName === "testnet" || walletNetworkName === "devnet"
      ? walletNetworkName
      : null;

  return !connected || walletNetworkName === selectedNetwork ? (
    <></>
  ) : (
    <Dialog.Root open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg rounded-lg p-6 bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out w-[90vw] max-w-md">
          <div className="text-center">
            <Dialog.Title className="text-3xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Wrong Network
            </Dialog.Title>
            <Dialog.Description className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Your wallet is on <span className="font-bold">{network?.name}</span>. The app is set to{" "}
              <span className="font-bold">{selectedNetwork}</span>. Switch the app to your wallet network to continue.
            </Dialog.Description>
            {walletNetworkValid && (
              <button
                type="button"
                onClick={() => setSelectedNetwork(walletNetworkValid)}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:brightness-110 transition"
              >
                Use {walletNetworkName}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
