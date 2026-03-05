import { useCallback, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/utils/aptosClient";
import { buildPostCommentPayload } from "@/entry-functions/postComment";
import { buildCastVotePayload } from "@/entry-functions/castVote";
import { buildDeleteCommentPayload } from "@/entry-functions/deleteComment";
import { getModuleAddress } from "@/constants";
import { useSelectedNetwork } from "@/hooks/useSelectedNetwork";

export function useVibeActions() {
  const { account, signAndSubmitTransaction } = useWallet();
  const network = useSelectedNetwork();
  const [isPending, setIsPending] = useState(false);
  const moduleAddress = getModuleAddress(network);

  const postComment = useCallback(
    async (content: string, targetObjAddress: string): Promise<string | null> => {
      if (!account || !moduleAddress) return null;
      setIsPending(true);
      try {
        const committed = await signAndSubmitTransaction(
          buildPostCommentPayload({ content, targetObjAddress, moduleAddress })
        );
        const executed = await aptosClient(network).waitForTransaction({
          transactionHash: committed.hash,
        });
        const events = (executed as { events?: Array<{ type: string; data: { comment?: string } }> }).events ?? [];
        const created = events.find(
          (e) => e.type?.includes("CommentCreated") && e.data?.comment
        );
        const commentAddress = created?.data?.comment ?? null;
        return commentAddress;
      } catch (err) {
        console.error(err);
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [account, moduleAddress, network, signAndSubmitTransaction]
  );

  const castVote = useCallback(
    async (commentObjectAddress: string, up: boolean): Promise<boolean> => {
      if (!account || !moduleAddress) return false;
      setIsPending(true);
      try {
        const committed = await signAndSubmitTransaction(
          buildCastVotePayload({ commentObjectAddress, up, moduleAddress })
        );
        await aptosClient(network).waitForTransaction({
          transactionHash: committed.hash,
        });
        return true;
      } catch (err) {
        console.error(err);
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [account, moduleAddress, network, signAndSubmitTransaction]
  );

  const deleteComment = useCallback(
    async (commentObjectAddress: string): Promise<boolean> => {
      if (!account || !moduleAddress) return false;
      setIsPending(true);
      try {
        const committed = await signAndSubmitTransaction(
          buildDeleteCommentPayload({ commentObjectAddress, moduleAddress })
        );
        await aptosClient(network).waitForTransaction({
          transactionHash: committed.hash,
        });
        return true;
      } catch (err) {
        console.error(err);
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [account, moduleAddress, network, signAndSubmitTransaction]
  );

  return { postComment, castVote, deleteComment, isPending };
}
