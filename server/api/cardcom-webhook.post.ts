import { defineEventHandler, getQuery, readBody } from "h3";
import { handleCardcomWebhook } from "@/backend/server/cardcomWebhook.handler";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  let body: unknown = null;
  try {
    body = await readBody(event);
  } catch {
    body = null;
  }

  const payload =
    body && typeof body === "object" && Object.keys(body as object).length > 0
      ? { ...query, ...(body as object) }
      : query;

  const { status, body: text } = await handleCardcomWebhook(payload);
  event.node.res.statusCode = status;
  return text;
});
