import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useVibeActions } from "@/hooks/useVibeActions";
import { getComment } from "@/view-functions/getComment";
import {
  getCommentAddressesByTarget,
  getAllCommentAddresses,
} from "@/view-functions/getCommentAddressesByTarget";
import { CommentData } from "@/view-functions/getComment";
import { MODULE_ADDRESS, NETWORK } from "@/constants";
import { VibeButton } from "@/components/VibeButton";
import { useToast } from "@/components/ui/use-toast";

type VibeFeedProps = {
  targetObjAddress: string;
  onTargetChange?: (addr: string) => void;
};

function toExplorerAccountUrl(address: string) {
  const net = NETWORK === "mainnet" ? "mainnet" : NETWORK === "testnet" ? "testnet" : "devnet";
  return `https://explorer.aptoslabs.com/account/${address}?network=${net}`;
}

/** Comment card for center panel (object thread) - design style */
function CommentCard({
  commentAddress,
  data,
  onVote,
  isPending,
  viewerAddress,
  showVoting = true,
}: {
  commentAddress: string;
  data: CommentData;
  onVote: (addr: string, up: boolean) => Promise<boolean>;
  isPending: boolean;
  viewerAddress?: string;
  showVoting?: boolean;
}) {
  const canVote =
    !!viewerAddress &&
    data.author?.toLowerCase?.() !== viewerAddress.toLowerCase();
  const shouldShowVoting = showVoting && canVote;

  return (
    <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
      <div className="size-10 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-mono">
        {data.author.slice(2, 6)}
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-bold truncate">
            {data.author.slice(0, 10)}...
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-mono shrink-0">
            Score: {data.vibeScore}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono flex-wrap">
          <a
            className="underline underline-offset-4 hover:text-primary"
            href={toExplorerAccountUrl(commentAddress)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {commentAddress.slice(0, 10)}...{commentAddress.slice(-6)}
          </a>
        </div>
        <p className="text-base text-slate-700 dark:text-slate-300 break-words">
          {data.content}
        </p>
        {shouldShowVoting && (
          <div className="flex gap-4 mt-2 text-slate-400">
            <VibeButton
              commentAddress={commentAddress}
              up={true}
              onVote={onVote}
              disabled={isPending}
              className="flex items-center gap-1 text-xs hover:text-primary"
            />
            <VibeButton
              commentAddress={commentAddress}
              up={false}
              onVote={onVote}
              disabled={isPending}
              className="flex items-center gap-1 text-xs hover:text-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function VibeFeed({ targetObjAddress, onTargetChange }: VibeFeedProps) {
  const { account } = useWallet();
  const { postComment, castVote, isPending } = useVibeActions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newContent, setNewContent] = useState("");
  const myAddress = account?.address?.toString?.() ?? "";
  const myAddressLower = myAddress.toLowerCase();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: text });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to copy" });
    }
  };

  const queryKey = ["vibe-comments", targetObjAddress];
  const [localCommentAddrs, setLocalCommentAddrs] = useState<string[]>([]);

  const { data: fetchedAddresses = [] } = useQuery({
    queryKey,
    queryFn: () => getCommentAddressesByTarget(targetObjAddress),
    enabled: !!targetObjAddress && targetObjAddress.length > 1,
  });

  const commentAddresses = Array.from(
    new Set([...fetchedAddresses, ...localCommentAddrs])
  );

  const { data: globalComments = [] } = useQuery({
    queryKey: ["vibe-global-comments"],
    queryFn: getAllCommentAddresses,
    enabled: !!MODULE_ADDRESS,
  });

  const handlePostComment = async () => {
    if (!newContent.trim() || !targetObjAddress) return;
    const addr = await postComment(newContent.trim(), targetObjAddress);
    if (addr) {
      setNewContent("");
      setLocalCommentAddrs((prev) => [...prev, addr]);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["vibe-global-comments"] });
      toast({ title: "Comment posted", description: `Comment at ${addr.slice(0, 10)}...` });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to post comment" });
    }
  };

  const recentComments = [...globalComments].reverse().slice(0, 20);
  const myComments = myAddress
    ? globalComments.filter((e) => e.author?.toLowerCase() === myAddress.toLowerCase())
    : [];

  const viewTarget = (addr: string) => onTargetChange?.(addr);

  // No object loaded: 2 columns only (Recent | My comments)
  if (!targetObjAddress) {
    return (
      <div className="flex flex-1 w-full overflow-hidden">
        <aside className="flex-1 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-background-dark/50 overflow-y-auto">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recent (newest first)
            </h3>
            <span className="material-symbols-outlined text-primary text-sm">sensors</span>
          </div>
          <div className="flex flex-col">
            {recentComments.length === 0 ? (
              <p className="p-4 text-base text-slate-500 dark:text-slate-400">No comments yet.</p>
            ) : (
              recentComments.map((e, i) => (
                <SidebarCommentItem
                  key={`recent-${e.comment}-${i}`}
                  commentAddress={e.comment}
                  targetObj={e.target_obj}
                  onViewTarget={viewTarget}
                  onCopy={copyToClipboard}
                  viewerAddressLower={myAddressLower}
                />
              ))
            )}
          </div>
        </aside>
        <aside className="flex-1 border-l border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-background-dark/50 overflow-y-auto">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-slate-50 dark:bg-background-dark/90 backdrop-blur-md z-10">
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              My comments
            </h3>
            <span className="material-symbols-outlined text-primary text-sm">bookmark</span>
          </div>
          <div className="flex flex-col p-2 gap-2">
            {!myAddress ? (
              <p className="p-4 text-base text-slate-500 dark:text-slate-400">
                Connect a wallet to see your comments.
              </p>
            ) : myComments.length === 0 ? (
              <p className="p-4 text-base text-slate-500 dark:text-slate-400">
                No comments from this wallet.
              </p>
            ) : (
              [...myComments].reverse().map((e, i) => (
                <SidebarCommentItem
                  key={`my-${e.comment}-${i}`}
                  commentAddress={e.comment}
                  targetObj={e.target_obj}
                  onViewTarget={viewTarget}
                  onCopy={copyToClipboard}
                  viewerAddressLower={myAddressLower}
                />
              ))
            )}
          </div>
        </aside>
      </div>
    );
  }

  // Object loaded: 3 columns — Recent | Object (center) | My comments
  return (
    <>
      <aside className="w-72 lg:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-background-dark/50 overflow-y-auto shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recent
          </h3>
          <span className="material-symbols-outlined text-primary text-sm">sensors</span>
        </div>
        <div className="flex flex-col">
          {recentComments.length === 0 ? (
            <p className="p-4 text-base text-slate-500 dark:text-slate-400">No comments yet.</p>
          ) : (
            recentComments.slice(0, 15).map((e, i) => (
              <SidebarCommentItem
                key={`recent-${e.comment}-${i}`}
                commentAddress={e.comment}
                targetObj={e.target_obj}
                onViewTarget={viewTarget}
                isActive={e.target_obj === targetObjAddress}
                onCopy={copyToClipboard}
                viewerAddressLower={myAddressLower}
              />
            ))
          )}
        </div>
      </aside>

      <section className="flex-1 flex flex-col bg-background-light dark:bg-background-dark overflow-hidden relative min-w-0">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-background-dark/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                  Active Object
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                  {targetObjAddress.slice(0, 10)}...{targetObjAddress.slice(-6)}
                </span>
                <button
                  type="button"
                  className="text-slate-500 dark:text-slate-400 hover:text-primary"
                  onClick={() => copyToClipboard(targetObjAddress)}
                  title="Copy address"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
                <a
                  className="text-slate-500 dark:text-slate-400 hover:text-primary"
                  href={toExplorerAccountUrl(targetObjAddress)}
                  target="_blank"
                  rel="noreferrer"
                  title="Open in Aptos Explorer"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </a>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
                Object discussion
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Real-time object discussion thread
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 placeholder:text-slate-400 resize-none min-h-[80px] text-sm"
              placeholder="Add your vibe to this object..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 text-xs">{newContent.length}/500</span>
              <button
                type="button"
                onClick={handlePostComment}
                disabled={!newContent.trim() || isPending}
                className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-lg disabled:opacity-50 hover:brightness-110 transition"
              >
                Post Vibe
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {commentAddresses.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No comments yet for this object.
              </p>
            ) : (
              commentAddresses.map((addr) => (
                <CommentCardLoader
                  key={addr}
                  commentAddress={addr}
                  onVote={castVote}
                  isPending={isPending}
                  viewerAddressLower={myAddressLower}
                  showVoting
                />
              ))
            )}
          </div>
        </div>
      </section>

      <aside className="w-72 lg:w-80 border-l border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-background-dark/50 overflow-y-auto shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-slate-50 dark:bg-background-dark/90 backdrop-blur-md z-10">
          <h3 className="text-base font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            My comments
          </h3>
          <span className="material-symbols-outlined text-primary text-sm">bookmark</span>
        </div>
        <div className="flex flex-col p-2 gap-2">
          {!myAddress ? (
            <p className="p-4 text-base text-slate-500 dark:text-slate-400">
              Connect a wallet to see your comments.
            </p>
          ) : myComments.length === 0 ? (
            <p className="p-4 text-base text-slate-500 dark:text-slate-400">
              No comments from this wallet.
            </p>
          ) : (
            [...myComments].reverse().map((e, i) => (
              <SidebarCommentItem
                key={`my-${e.comment}-${i}`}
                commentAddress={e.comment}
                targetObj={e.target_obj}
                onViewTarget={viewTarget}
                isActive={e.target_obj === targetObjAddress}
                onCopy={copyToClipboard}
                viewerAddressLower={myAddressLower}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
}

/** Sidebar item: compact card with target link (Recent / My comments) */
function SidebarCommentItem({
  commentAddress,
  targetObj,
  onViewTarget,
  isActive = false,
  onCopy,
  viewerAddressLower,
}: {
  commentAddress: string;
  targetObj: string;
  onViewTarget: (addr: string) => void;
  isActive?: boolean;
  onCopy: (text: string) => void;
  viewerAddressLower: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["vibe-comment", commentAddress],
    queryFn: () => getComment(commentAddress),
  });

  const isMine = !!viewerAddressLower && (data?.author?.toLowerCase?.() === viewerAddressLower);

  return (
    <div
      className={`flex flex-col p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer transition ${
        isActive ? "bg-primary/5 border-l-2 border-l-primary" : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80"
      }`}
      onClick={() => onViewTarget(targetObj)}
      onKeyDown={(e) => e.key === "Enter" && onViewTarget(targetObj)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-2 mb-1 min-w-0">
        <a
          className="text-xs font-mono text-primary truncate underline underline-offset-4 hover:opacity-90"
          href={toExplorerAccountUrl(targetObj)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Open target in Aptos Explorer"
        >
          {targetObj.slice(0, 8)}...{targetObj.slice(-4)}
        </a>
        <button
          type="button"
          className="text-slate-500 dark:text-slate-400 hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onCopy(targetObj);
          }}
          title="Copy target address"
        >
          <span className="material-symbols-outlined text-[16px]">content_copy</span>
        </button>
        <button
          type="button"
          className="text-slate-500 dark:text-slate-400 hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onCopy(commentAddress);
          }}
          title="Copy comment object address"
        >
          <span className="material-symbols-outlined text-[16px]">tag</span>
        </button>
      </div>
      {isLoading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : data ? (
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 italic">
          &quot;{data.content.slice(0, 80)}{data.content.length > 80 ? "…" : ""}&quot;
        </p>
      ) : null}
      {isMine && (
        <div className="mt-1 text-[10px] font-mono text-slate-400">
          Your comment
        </div>
      )}
      <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
        <span className="text-[10px] text-primary font-bold flex items-center gap-1">
          GO TO THREAD <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
        </span>
      </div>
    </div>
  );
}

function CommentCardLoader({
  commentAddress,
  onVote,
  isPending,
  showVoting = true,
  viewerAddressLower,
}: {
  commentAddress: string;
  onVote: (addr: string, up: boolean) => Promise<boolean>;
  isPending: boolean;
  showVoting?: boolean;
  viewerAddressLower: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vibe-comment", commentAddress],
    queryFn: () => getComment(commentAddress),
  });

  if (isLoading) {
    return (
      <div className="flex gap-4 p-4 rounded-xl">
        <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse" />
        </div>
      </div>
    );
  }
  if (error || !data) return null;

  return (
    <CommentCard
      commentAddress={commentAddress}
      data={data}
      onVote={onVote}
      isPending={isPending}
      viewerAddress={viewerAddressLower}
      showVoting={showVoting}
    />
  );
}
