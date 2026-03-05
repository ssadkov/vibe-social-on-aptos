import { Network as SdkNetwork } from "@aptos-labs/ts-sdk";

export type AppNetwork = "devnet" | "testnet" | "mainnet";

const RAW_DEFAULT_NETWORK = import.meta.env.VITE_APP_NETWORK;
export const DEFAULT_NETWORK: AppNetwork =
  RAW_DEFAULT_NETWORK === "mainnet" || RAW_DEFAULT_NETWORK === "devnet" || RAW_DEFAULT_NETWORK === "testnet"
    ? RAW_DEFAULT_NETWORK
    : "testnet";

export function toSdkNetwork(network: AppNetwork): SdkNetwork {
  return network === "mainnet"
    ? SdkNetwork.MAINNET
    : network === "testnet"
      ? SdkNetwork.TESTNET
      : SdkNetwork.DEVNET;
}

export const APTOS_API_KEY = import.meta.env.VITE_APTOS_API_KEY;

export const MODULE_ADDRESS_DEVNET =
  import.meta.env.VITE_MODULE_ADDRESS_DEVNET ?? import.meta.env.VITE_MODULE_ADDRESS;
export const MODULE_ADDRESS_TESTNET =
  import.meta.env.VITE_MODULE_ADDRESS_TESTNET ?? import.meta.env.VITE_MODULE_ADDRESS;
export const MODULE_ADDRESS_MAINNET =
  import.meta.env.VITE_MODULE_ADDRESS_MAINNET ?? import.meta.env.VITE_MODULE_ADDRESS;

export function getModuleAddress(network: AppNetwork): string | undefined {
  return network === "mainnet"
    ? MODULE_ADDRESS_MAINNET
    : network === "testnet"
      ? MODULE_ADDRESS_TESTNET
      : MODULE_ADDRESS_DEVNET;
}

export function getIndexerGraphqlUrl(network: AppNetwork): string {
  return network === "mainnet"
    ? "https://api.mainnet.aptoslabs.com/v1/graphql"
    : network === "testnet"
      ? "https://api.testnet.aptoslabs.com/v1/graphql"
      : "https://api.devnet.aptoslabs.com/v1/graphql";
}

export function getFullnodeUrl(network: AppNetwork): string {
  return network === "mainnet"
    ? "https://fullnode.mainnet.aptoslabs.com"
    : network === "testnet"
      ? "https://fullnode.testnet.aptoslabs.com"
      : "https://fullnode.devnet.aptoslabs.com";
}
