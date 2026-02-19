import { MODULE_ADDRESS } from "@/constants";
import { aptosClient } from "@/utils/aptosClient";

export type CommentData = {
  content: string;
  author: string;
  targetObj: string;
  vibeScore: number;
};

export const getComment = async (commentAddress: string): Promise<CommentData> => {
  const [content, author, targetObj, vibeScore] = await aptosClient().view<
    [string, string, string, number]
  >({
    payload: {
      function: `${MODULE_ADDRESS}::vibe_social::get_comment`,
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
