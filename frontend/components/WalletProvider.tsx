import { PropsWithChildren } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import type { Network } from "@aptos-labs/wallet-adapter-react";
// Internal components
import { useToast } from "@/components/ui/use-toast";
// Internal constants
import { APTOS_API_KEY } from "@/constants";
import { useSelectedNetwork } from "@/hooks/useSelectedNetwork";

export function WalletProvider({ children }: PropsWithChildren) {
  const { toast } = useToast();
  const network = useSelectedNetwork();
  const walletNetwork = network as unknown as Network;

  return (
    <AptosWalletAdapterProvider
      key={network}
      autoConnect={true}
      dappConfig={{ network: walletNetwork, aptosApiKeys: { [walletNetwork]: APTOS_API_KEY } }}
      onError={(error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Unknown wallet error",
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
