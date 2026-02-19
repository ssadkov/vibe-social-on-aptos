import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type PostCommentArguments = {
  content: string;
  targetObjAddress: string;
};

export const buildPostCommentPayload = (
  args: PostCommentArguments
): InputTransactionData => ({
  data: {
    function: `${MODULE_ADDRESS}::vibe_social::create_comment`,
    functionArguments: [args.content, args.targetObjAddress],
  },
});
