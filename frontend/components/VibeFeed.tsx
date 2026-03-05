import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useVibeActions } from "@/hooks/useVibeActions";
import { getComment } from "@/view-functions/getComment";
import {
  getCommentAddressesByTarget,
  getAllCommentAddresses,
} from "@/view-functions/getCommentAddressesByTarget";
import { CommentData } from "@/view-functions/getComment";
import { MODULE_ADDRESS } from "@/constants";
import { VibeButton } from "@/components/VibeButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

type VibeFeedProps = {
  targetObjAddress: string;
  onTargetChange?: (addr: string) => void;
};

function CommentCard({
  commentAddress,
  data,
  onVote,
  isPending,
}: {
  commentAddress: string;
  data: CommentData;
  onVote: (addr: string, up: boolean) => Promise<boolean>;
  isPending: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2 text-sm text-muted-foreground">
        Author: {data.author.slice(0, 8)}... | Score: {data.vibeScore}
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">{data.content}</p>
        <div className="flex gap-2">
          <VibeButton
            commentAddress={commentAddress}
            up={true}
            onVote={onVote}
            disabled={isPending}
          />
          <VibeButton
            commentAddress={commentAddress}
            up={false}
            onVote={onVote}
            disabled={isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function VibeFeed({ targetObjAddress, onTargetChange }: VibeFeedProps) {
  const { account } = useWallet();
  const { postComment, castVote, isPending } = useVibeActions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newContent, setNewContent] = useState("");
  const [targetInput, setTargetInput] = useState(targetObjAddress);
  const myAddress = account?.address?.toString?.() ?? "";

  const queryKey = ["vibe-comments", targetObjAddress];

  const [localCommentAddrs, setLocalCommentAddrs] = useState<string[]>([]);

  const { data: fetchedAddresses = [], refetch } = useQuery({
    queryKey,
    queryFn: () => getCommentAddressesByTarget(targetObjAddress),
    enabled: !!targetObjAddress && targetObjAddress.length > 1,
  });

  const commentAddresses = Array.from(
    new Set([...fetchedAddresses, ...localCommentAddrs])
  );

  useEffect(() => {
    if (targetObjAddress) setTargetInput(targetObjAddress);
  }, [targetObjAddress]);

  const handleLoadTarget = () => {
    const trimmed = targetInput.trim();
    if (trimmed && onTargetChange) onTargetChange(trimmed);
    refetch();
  };

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Target object address (vibe checks)</label>
        <div className="flex gap-2">
          <Input
            placeholder="0x..."
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
          />
          <Button onClick={handleLoadTarget} variant="secondary">
            Load
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent comments — left column */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent (newest first)</h4>
          {recentComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
              {recentComments.map((e, i) => (
                <RecentCommentCard
                  key={`recent-${e.comment}-${i}`}
                  commentAddress={e.comment}
                  targetObj={e.target_obj}
                  onTargetChange={(addr) => {
                    setTargetInput(addr);
                    onTargetChange?.(addr);
                  }}
                  onVote={castVote}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* My comments — right column */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">My comments</h4>
          {!myAddress ? (
            <p className="text-sm text-muted-foreground">Connect a wallet to see your comments.</p>
          ) : myComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments from this wallet.</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
              {[...myComments].reverse().map((e, i) => (
                <RecentCommentCard
                  key={`my-${e.comment}-${i}`}
                  commentAddress={e.comment}
                  targetObj={e.target_obj}
                  onTargetChange={(addr) => {
                    setTargetInput(addr);
                    onTargetChange?.(addr);
                  }}
                  onVote={castVote}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {targetObjAddress && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">New comment</label>
            <div className="flex gap-2">
              <Input
                placeholder="Your comment..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                maxLength={500}
              />
              <Button
                onClick={handlePostComment}
                disabled={!newContent.trim() || isPending}
              >
                Post
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-medium">Comments</h4>
            {commentAddresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet for this object.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {commentAddresses.map((addr) => (
                  <CommentCardLoader
                    key={addr}
                    commentAddress={addr}
                    onVote={castVote}
                    isPending={isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CommentCardLoader({
  commentAddress,
  onVote,
  isPending,
}: {
  commentAddress: string;
  onVote: (addr: string, up: boolean) => Promise<boolean>;
  isPending: boolean;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vibe-comment", commentAddress],
    queryFn: () => getComment(commentAddress),
  });

  if (isLoading) return <Card><CardContent className="pt-4">Loading...</CardContent></Card>;
  if (error || !data) return null;

  return (
    <CommentCard
      commentAddress={commentAddress}
      data={data}
      onVote={onVote}
      isPending={isPending}
    />
  );
}

/** Card for a comment in Recent / My comments: loads full comment and shows "View target" */
function RecentCommentCard({
  commentAddress,
  targetObj,
  onTargetChange,
  onVote,
  isPending,
}: {
  commentAddress: string;
  targetObj: string;
  onTargetChange?: (addr: string) => void;
  onVote: (addr: string, up: boolean) => Promise<boolean>;
  isPending: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <span className="font-medium">Target</span>
        <span className="truncate max-w-[240px]">{targetObj}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs px-2"
          onClick={() => onTargetChange?.(targetObj)}
        >
          View
        </Button>
      </div>
      <CommentCardLoader
        commentAddress={commentAddress}
        onVote={onVote}
        isPending={isPending}
      />
    </div>
  );
}
