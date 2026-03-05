import type { AppNetwork } from "@/constants";
import { APTOS_API_KEY, toSdkNetwork } from "@/constants";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

const clients = new Map<AppNetwork, Aptos>();

// Reuse same Aptos instance per network (cookie based sticky routing).
export function aptosClient(network: AppNetwork) {
  const existing = clients.get(network);
  if (existing) return existing;

  const aptos = new Aptos(
    new AptosConfig({ network: toSdkNetwork(network), clientConfig: { API_KEY: APTOS_API_KEY } })
  );
  clients.set(network, aptos);
  return aptos;
}
