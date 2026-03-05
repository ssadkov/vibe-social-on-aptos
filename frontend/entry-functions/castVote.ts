import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type CastVoteArguments = {
  commentObjectAddress: string;
  up: boolean;
  moduleAddress: string;
};

export const buildCastVotePayload = (
  args: CastVoteArguments
): InputTransactionData => ({
  data: {
    function: `${args.moduleAddress}::vibe_social::vote`,
    functionArguments: [args.commentObjectAddress, args.up],
  },
});
