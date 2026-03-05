import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type PostCommentArguments = {
  content: string;
  targetObjAddress: string;
  moduleAddress: string;
};

export const buildPostCommentPayload = (
  args: PostCommentArguments
): InputTransactionData => ({
  data: {
    function: `${args.moduleAddress}::vibe_social::create_comment`,
    functionArguments: [args.content, args.targetObjAddress],
  },
});
