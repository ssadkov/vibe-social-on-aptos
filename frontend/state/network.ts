import { DEFAULT_NETWORK, type AppNetwork } from "@/constants";

export const NETWORK_STORAGE_KEY = "object-vibe:selected-network";

export function getSelectedNetwork(): AppNetwork {
  if (typeof window === "undefined") return DEFAULT_NETWORK;
  const raw = window.localStorage.getItem(NETWORK_STORAGE_KEY);
  if (raw === "devnet" || raw === "testnet" || raw === "mainnet") return raw;
  return DEFAULT_NETWORK;
}

export function setSelectedNetwork(network: AppNetwork) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NETWORK_STORAGE_KEY, network);
  window.dispatchEvent(new CustomEvent("object-vibe:network-changed", { detail: network }));
}

export function subscribeSelectedNetwork(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("object-vibe:network-changed", handler as EventListener);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("object-vibe:network-changed", handler as EventListener);
    window.removeEventListener("storage", handler);
  };
}

