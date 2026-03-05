import { useEffect, useState } from "react";
import { getSelectedNetwork, subscribeSelectedNetwork } from "@/state/network";
import type { AppNetwork } from "@/constants";

export function useSelectedNetwork(): AppNetwork {
  const [network, setNetwork] = useState<AppNetwork>(() => getSelectedNetwork());

  useEffect(() => {
    return subscribeSelectedNetwork(() => setNetwork(getSelectedNetwork()));
  }, []);

  return network;
}

