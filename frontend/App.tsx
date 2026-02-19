import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { VibeFeed } from "@/components/VibeFeed";

function App() {
  const { connected } = useWallet();
  const [vibeTargetAddress, setVibeTargetAddress] = useState("");

  return (
    <>
      <Header />
      <div className="flex items-center justify-center flex-col">
        {connected ? (
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <h3 className="text-lg font-semibold">Vibe Social</h3>
              <p className="text-sm text-muted-foreground">
                Enter any Aptos object address to view and add vibe comments.
              </p>
              <VibeFeed
                targetObjAddress={vibeTargetAddress}
                onTargetChange={setVibeTargetAddress}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Connect a wallet to get started</CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>
    </>
  );
}

export default App;
