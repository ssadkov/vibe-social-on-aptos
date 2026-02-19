import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type DeleteCommentArguments = {
  commentObjectAddress: string;
};

export const buildDeleteCommentPayload = (
  args: DeleteCommentArguments
): InputTransactionData => ({
  data: {
    function: `${MODULE_ADDRESS}::vibe_social::delete_comment`,
    functionArguments: [args.commentObjectAddress],
  },
});
