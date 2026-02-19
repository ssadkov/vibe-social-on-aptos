import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type CastVoteArguments = {
  commentObjectAddress: string;
  up: boolean;
};

export const buildCastVotePayload = (
  args: CastVoteArguments
): InputTransactionData => ({
  data: {
    function: `${MODULE_ADDRESS}::vibe_social::vote`,
    functionArguments: [args.commentObjectAddress, args.up],
  },
});
