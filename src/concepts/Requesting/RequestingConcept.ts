import { Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors";
import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import { exclusions, inclusions } from "./passthrough.ts";
import "jsr:@std/dotenv/load";

/**
 * # Requesting concept configuration
 * The following environment variables are available:
 *
 * - PORT: the port to the server binds, default 10000
 * - REQUESTING_BASE_URL: the base URL prefix for api requests, default "/api"
 * - REQUESTING_TIMEOUT: the timeout for requests, default 10000ms
 * - REQUESTING_SAVE_RESPONSES: whether to persist responses or not, default true
 */
const PORT = parseInt(Deno.env.get("PORT") ?? "8000", 10);
const REQUESTING_BASE_URL = Deno.env.get("REQUESTING_BASE_URL") ?? "/api";
const REQUESTING_TIMEOUT = parseInt(
  Deno.env.get("REQUESTING_TIMEOUT") ?? "10000",
  10,
);

// TODO: make sure you configure this environment variable for proper CORS configuration
const REQUESTING_ALLOWED_DOMAIN = Deno.env.get("REQUESTING_ALLOWED_DOMAIN") ??
  "*";

// Choose whether or not to persist responses
const REQUESTING_SAVE_RESPONSES = Deno.env.get("REQUESTING_SAVE_RESPONSES") ??
  true;

const PREFIX = "Requesting" + ".";

// --- Type Definitions ---
type Request = ID;

/**
 * a set of Requests with
 *   an input unknown
 *   an optional response unknown
 */
interface RequestDoc {
  _id: Request;
  input: { path: string; [key: string]: unknown };
  response?: unknown;
  createdAt: Date;
}

/**
 * Represents an in-flight request waiting for a response.
 * This state is not persisted and lives only in memory.
 */
interface PendingRequest {
  promise: Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

/**
 * The Requesting concept encapsulates an API server, modeling incoming
 * requests and outgoing responses as concept actions.
 */
export default class RequestingConcept {
  private readonly requests: Collection<RequestDoc>;
  private readonly pending: Map<Request, PendingRequest> = new Map();
  private readonly timeout: number;

  constructor(private readonly db: Db) {
    this.requests = this.db.collection(PREFIX + "requests");
    this.timeout = REQUESTING_TIMEOUT;
    console.log(
      `\nRequesting concept initialized with a timeout of ${this.timeout}ms.`,
    );
  }

  /**
   * request (path: String, ...): (request: Request)
   * System action triggered by an external HTTP request.
   *
   * **requires** true
   *
   * **effects** creates a new Request `r`; sets the input of `r` to be the path and all other input parameters; returns `r` as `request`
   */
  async request(
    inputs: { path: string; [key: string]: unknown },
  ): Promise<{ request: Request }> {
    const requestId = freshID() as Request;
    const requestDoc: RequestDoc = {
      _id: requestId,
      input: inputs,
      createdAt: new Date(),
    };

    // Persist the request for logging/auditing purposes.
    await this.requests.insertOne(requestDoc);

    // Create an in-memory pending request to manage the async response.
    let resolve!: (value: unknown) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<unknown>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this.pending.set(requestId, { promise, resolve, reject });

    return { request: requestId };
  }

  /**
   * respond (request: Request, [key: string]: unknown)
   *
   * **requires** a Request with the given `request` id exists and has no response yet
   *
   * **effects** sets the response of the given Request to the provided key-value pairs.
   */
  async respond(
    { request, ...response }: { request: Request; [key: string]: unknown },
  ): Promise<{ request: string }> {
    const pendingRequest = this.pending.get(request);
    if (pendingRequest) {
      // Resolve the promise for any waiting `_awaitResponse` call.
      pendingRequest.resolve(response);
    }

    // Update the persisted request document with the response.
    if (REQUESTING_SAVE_RESPONSES) {
      await this.requests.updateOne({ _id: request }, { $set: { response } });
    }

    return { request };
  }

  /**
   * _awaitResponse (request: Request): (response: unknown)
   *
   * **effects** returns the response associated with the given request, waiting if necessary up to a configured timeout.
   */
  async _awaitResponse(
    { request }: { request: Request },
  ): Promise<{ response: unknown }[]> {
    const pendingRequest = this.pending.get(request);

    if (!pendingRequest) {
      // The request might have been processed already or never existed.
      // We could check the database for a persisted response here if needed.
      throw new Error(
        `Request ${request} is not pending or does not exist: it may have timed-out.`,
      );
    }

    let timeoutId: number;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () =>
          reject(
            new Error(`Request ${request} timed out after ${this.timeout}ms`),
          ),
        this.timeout,
      );
    });

    try {
      // Race the actual response promise against the timeout.
      const response = await Promise.race([
        pendingRequest.promise,
        timeoutPromise,
      ]);
      return [{ response }];
    } finally {
      // Clean up regardless of outcome.
      clearTimeout(timeoutId!);
      this.pending.delete(request);
    }
  }
}

/**
 * Starts the Hono web server that listens for incoming requests and pipes them
 * into the Requesting concept instance. Additionally, it allows passthrough
 * requests to concept actions by default. These should be
 * @param concepts The complete instantiated concepts import from "@concepts"
 */
export function startRequestingServer(
  // deno-lint-ignore no-explicit-any
  concepts: Record<string, any>,
) {
  // deno-lint-ignore no-unused-vars
  const { Requesting, client, db, Engine, ...instances } = concepts;
  if (!(Requesting instanceof RequestingConcept)) {
    throw new Error("Requesting concept missing or broken.");
  }
  const app = new Hono();
  app.use(
    "/*",
    cors({
      origin: REQUESTING_ALLOWED_DOMAIN,
    }),
  );

  /**
   * PASSTHROUGH ROUTES
   *
   * These routes register against every concept action and query.
   * While convenient, you should confirm that they are either intentional
   * inclusions and specify a reason, or if they should be excluded and
   * handled by Requesting instead.
   */

  console.log("\nRegistering concept passthrough routes.");
  let unverified = false;
  for (const [conceptName, concept] of Object.entries(instances)) {
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(concept),
    )
      .filter((name) =>
        name !== "constructor" && typeof concept[name] === "function"
      );
    for (const method of methods) {
      const route = `${REQUESTING_BASE_URL}/${conceptName}/${method}`;
      if (exclusions.includes(route)) continue;
      const included = route in inclusions;
      if (!included) unverified = true;
      const msg = included
        ? `  -> ${route}`
        : `WARNING - UNVERIFIED ROUTE: ${route}`;

      app.post(route, async (c) => {
        try {
          const body = await c.req.json().catch(() => ({})); // Handle empty body
          const result = await concept[method](body);
          return c.json(result);
        } catch (e) {
          console.error(`Error in ${conceptName}.${method}:`, e);
          return c.json({ error: "An internal server error occurred." }, 500);
        }
      });
      console.log(msg);
    }
  }
  const passthroughFile = "./src/concepts/Requesting/passthrough.ts";
  if (unverified) {
    console.log(`FIX: Please verify routes in: ${passthroughFile}`);
  }

  /**
   * REQUESTING ROUTES
   *
   * Captures all POST routes under the base URL.
   * The specific action path is extracted from the URL.
   */

  const routePath = `${REQUESTING_BASE_URL}/*`;
  app.post(routePath, async (c) => {
    try {
      const body = await c.req.json();
      if (typeof body !== "object" || body === null) {
        return c.json(
          { error: "Invalid request body. Must be a JSON object." },
          400,
        );
      }

      // Extract the specific action path from the request URL.
      // e.g., if base is /api and request is /api/users/create, path is /users/create
      const actionPath = c.req.path.substring(REQUESTING_BASE_URL.length);

      // Combine the path from the URL with the JSON body to form the action's input.
      const inputs = {
        ...body,
        path: actionPath,
      };

      console.log(`[Requesting] Received request for path: ${inputs.path}`);

      // 1. Trigger the 'request' action.
      const { request } = await Requesting.request(inputs);

      // 2. Await the response via the query. This is where the server waits for
      //    synchronizations to trigger the 'respond' action.
      const responseArray = await Requesting._awaitResponse({ request });

      // 3. Send the response back to the client.
      const { response } = responseArray[0];
      return c.json(response);
    } catch (e) {
      if (e instanceof Error) {
        console.error(`[Requesting] Error processing request:`, e.message);
        if (e.message.includes("timed out")) {
          return c.json({ error: "Request timed out." }, 504); // Gateway Timeout
        }
        return c.json({ error: "An internal server error occurred." }, 500);
      } else {
        return c.json({ error: "unknown error occurred." }, 418);
      }
    }
  });

  console.log(
    `\n🚀 Requesting server listening for POST requests at base path of ${routePath}`,
  );

  Deno.serve({ port: PORT }, app.fetch);
}
