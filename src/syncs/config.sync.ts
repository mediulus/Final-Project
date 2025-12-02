import { actions, type Sync } from "@/engine/mod.ts";
import { Requesting } from "@/concepts/Requesting/RequestingConcept.ts";

/**
 * Returns the Google Maps API key to authenticated clients
 * This keeps the API key secure by serving it from the backend
 * rather than exposing it in frontend code
 */
export const GetMapsApiKeyRequest: Sync = ({ request, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/config/mapsKey", session },
    { request },
  ]),
  then: actions([
    Requesting.respond,
    {
      request,
      apiKey: Deno.env.get("GOOGLE_MAPS_API_KEY") || "",
    },
  ]),
});
