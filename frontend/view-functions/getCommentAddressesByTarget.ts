import { MODULE_ADDRESS } from "@/constants";
import { NETWORK } from "@/constants";

const APTOS_NODE_URL =
  NETWORK === "mainnet"
    ? "https://fullnode.mainnet.aptoslabs.com"
    : NETWORK === "testnet"
      ? "https://fullnode.testnet.aptoslabs.com"
      : "https://fullnode.devnet.aptoslabs.com";

type CommentCreatedEvent = {
  type: string;
  data: { comment: string; author: string; target_obj: string };
};

const COMMENT_EVENTS_HANDLE = `${MODULE_ADDRESS}::vibe_social::CommentEvents`;
const COMMENT_CREATED_FIELD = "comment_created_events";

/**
 * Fetches comment object addresses for a given target object by querying CommentCreated events.
 * Uses the EventHandle at module address (all comments from all users).
 */
export async function getCommentAddressesByTarget(
  targetObjAddress: string
): Promise<string[]> {
  const url = `${APTOS_NODE_URL}/v1/accounts/${MODULE_ADDRESS}/events/${encodeURIComponent(COMMENT_EVENTS_HANDLE)}/${COMMENT_CREATED_FIELD}?limit=100`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const events: CommentCreatedEvent[] = await res.json();
  return events
    .filter((e) => e.data?.target_obj === targetObjAddress)
    .map((e) => e.data.comment);
}

/**
 * Fetches all recent comment addresses (any target) for the global feed.
 */
export async function getAllCommentAddresses(): Promise<
  { comment: string; target_obj: string; author: string }[]
> {
  const url = `${APTOS_NODE_URL}/v1/accounts/${MODULE_ADDRESS}/events/${encodeURIComponent(COMMENT_EVENTS_HANDLE)}/${COMMENT_CREATED_FIELD}?limit=100`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const events: CommentCreatedEvent[] = await res.json();
  return events.map((e) => ({
    comment: e.data.comment,
    target_obj: e.data.target_obj,
    author: e.data.author,
  }));
}
