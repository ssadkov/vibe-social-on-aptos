import type { AppNetwork } from "@/constants";
import { aptosClient } from "@/utils/aptosClient";

export type CommentData = {
  content: string;
  author: string;
  targetObj: string;
  vibeScore: number;
};

export const getComment = async (
  commentAddress: string,
  params: { network: AppNetwork; moduleAddress: string }
): Promise<CommentData> => {
  const [content, author, targetObj, vibeScore] = await aptosClient(params.network).view<
    [string, string, string, number]
  >({
    payload: {
      function: `${params.moduleAddress}::vibe_social::get_comment`,
      functionArguments: [commentAddress],
    },
  });
  return {
    content,
    author,
    targetObj,
    vibeScore: Number(vibeScore),
  };
};
