import { MODULE_ADDRESS } from "@/constants";
import { aptosClient } from "@/utils/aptosClient";

export const getVibeScore = async (commentAddress: string): Promise<number> => {
  const result = await aptosClient().view<[number]>({
    payload: {
      function: `${MODULE_ADDRESS}::vibe_social::get_vibe_score`,
      functionArguments: [commentAddress],
    },
  });
  return Number(result[0]);
};
