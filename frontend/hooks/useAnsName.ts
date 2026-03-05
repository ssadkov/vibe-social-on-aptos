import { useQuery } from "@tanstack/react-query";
import { getAnsNameByAddress } from "@/utils/ans";
import type { AppNetwork } from "@/constants";

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Resolve an address to its ANS name (e.g. "love.apt") with caching.
 * Returns the name or undefined while loading / when none found.
 */
export function useAnsName(
  address: string | undefined,
  network: AppNetwork
): string | undefined {
  const { data } = useQuery({
    queryKey: ["ans", network, address ?? ""],
    queryFn: () => getAnsNameByAddress(address!, network),
    enabled: !!address && address.startsWith("0x"),
    staleTime: STALE_TIME_MS,
  });
  return data ?? undefined;
}
