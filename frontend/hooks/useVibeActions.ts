import { useCallback, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/utils/aptosClient";
import { buildPostCommentPayload } from "@/entry-functions/postComment";
import { buildCastVotePayload } from "@/entry-functions/castVote";
import { buildDeleteCommentPayload } from "@/entry-functions/deleteComment";

export function useVibeActions() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [isPending, setIsPending] = useState(false);

  const postComment = useCallback(
    async (content: string, targetObjAddress: string): Promise<string | null> => {
      if (!account) return null;
      setIsPending(true);
      try {
        const committed = await signAndSubmitTransaction(
          buildPostCommentPayload({ content, targetObjAddress })
        );
        const executed = await aptosClient().waitForTransaction({
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
    [account, signAndSubmitTransaction]
  );

  const castVote = useCallback(
    async (commentObjectAddress: string, up: boolean): Promise<boolean> => {
      if (!account) return false;
      setIsPending(true);
      try {
        const committed = await signAndSubmitTransaction(
          buildCastVotePayload({ commentObjectAddress, up })
        );
        await aptosClient().waitForTransaction({
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
    [account, signAndSubmitTransaction]
  );

  const deleteComment = useCallback(
    async (commentObjectAddress: string): Promise<boolean> => {
      if (!account) return false;
      setIsPending(true);
      try {
        const committed = await signAndSubmitTransaction(
          buildDeleteCommentPayload({ commentObjectAddress })
        );
        await aptosClient().waitForTransaction({
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
    [account, signAndSubmitTransaction]
  );

  return { postComment, castVote, deleteComment, isPending };
}
