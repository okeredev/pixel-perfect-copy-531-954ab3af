// Vercel Node serverless function that adapts the TanStack Start SSR
// (Web Request -> Web Response) handler to Vercel's Node req/res.
//
// Build expects the SSR bundle at ../dist/server/server-entry.js.
// Static assets in dist/client are served directly by Vercel via vercel.json
// rewrites; this handler only runs for non-static requests.

import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
// @ts-expect-error — built artifact, not present until `vite build` runs
import * as serverEntry from "../dist/server/server.js";

type FetchHandler = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const handler =
  (serverEntry as { default?: FetchHandler }).default ??
  (serverEntry as unknown as FetchHandler);

function buildWebRequest(req: IncomingMessage): Request {
  const protocol = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = `${protocol}://${host}${req.url ?? "/"}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, String(value));
    }
  }

  const method = (req.method ?? "GET").toUpperCase();
  const init: RequestInit = { method, headers };

  if (method !== "GET" && method !== "HEAD") {
    // Convert the Node readable stream into a Web ReadableStream
    init.body = Readable.toWeb(req) as unknown as BodyInit;
    // Required when sending a stream body in Node 18+/undici
    (init as RequestInit & { duplex?: "half" }).duplex = "half";
  }

  return new Request(url, init);
}

async function sendWebResponse(response: Response, res: ServerResponse): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  const nodeStream = Readable.fromWeb(response.body as unknown as Parameters<typeof Readable.fromWeb>[0]);
  nodeStream.pipe(res);
  await new Promise<void>((resolve, reject) => {
    nodeStream.on("end", () => resolve());
    nodeStream.on("error", reject);
  });
}

export default async function vercelHandler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const request = buildWebRequest(req);
    const response = await handler.fetch(request, process.env, {});
    await sendWebResponse(response, res);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[vercel-handler] SSR error:", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/html; charset=utf-8");
    }
    res.end("<!doctype html><h1>500 — Internal error</h1>");
  }
}

// No `export const config` — Vercel auto-detects the Node.js runtime from the
// `.ts` extension. The Node version is controlled by the project's
// `engines.node` in package.json or the Vercel project settings.
