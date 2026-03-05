import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type DeleteCommentArguments = {
  commentObjectAddress: string;
  moduleAddress: string;
};

export const buildDeleteCommentPayload = (
  args: DeleteCommentArguments
): InputTransactionData => ({
  data: {
    function: `${args.moduleAddress}::vibe_social::delete_comment`,
    functionArguments: [args.commentObjectAddress],
  },
});
