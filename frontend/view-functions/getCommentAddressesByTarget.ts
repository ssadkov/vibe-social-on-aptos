import type { AppNetwork } from "@/constants";
import { getFullnodeUrl } from "@/constants";

type CommentCreatedEvent = {
  type: string;
  data: { comment: string; author: string; target_obj: string };
};

function getCommentEventsHandle(moduleAddress: string) {
  return `${moduleAddress}::vibe_social::CommentEvents`;
}
const COMMENT_CREATED_FIELD = "comment_created_events";

/**
 * Fetches comment object addresses for a given target object by querying CommentCreated events.
 * Uses the EventHandle at module address (all comments from all users).
 */
export async function getCommentAddressesByTarget(
  targetObjAddress: string,
  params: { network: AppNetwork; moduleAddress: string }
): Promise<string[]> {
  const baseUrl = getFullnodeUrl(params.network);
  const handle = getCommentEventsHandle(params.moduleAddress);
  const url = `${baseUrl}/v1/accounts/${params.moduleAddress}/events/${encodeURIComponent(handle)}/${COMMENT_CREATED_FIELD}?limit=100`;
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
export async function getAllCommentAddresses(params: {
  network: AppNetwork;
  moduleAddress: string;
}): Promise<{ comment: string; target_obj: string; author: string }[]> {
  const baseUrl = getFullnodeUrl(params.network);
  const handle = getCommentEventsHandle(params.moduleAddress);
  const url = `${baseUrl}/v1/accounts/${params.moduleAddress}/events/${encodeURIComponent(handle)}/${COMMENT_CREATED_FIELD}?limit=100`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const events: CommentCreatedEvent[] = await res.json();
  return events.map((e) => ({
    comment: e.data.comment,
    target_obj: e.data.target_obj,
    author: e.data.author,
  }));
}
