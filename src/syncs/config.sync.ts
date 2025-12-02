import { actions, Sync } from "@engine";
import { Requesting } from "@concepts";

/**
 * Returns the Google Maps API key to authenticated clients
 * This keeps the API key secure by serving it from the backend
 * rather than exposing it in frontend code
 */
export const GetMapsApiKeyRequest: Sync = (
  { request, apiKey },
) => ({
  when: actions([
    Requesting.request,
    { path: "/config/mapsKey" },
    { request },
  ]),
  where: (frames) => {
    // Get the API key from environment and bind it to the symbol
    const apiKeyValue = Deno.env.get("GOOGLE_MAPS_API_KEY") || "";

    return frames.map((frame) => ({
      ...frame,
      [apiKey]: apiKeyValue,
    }));
  },
  then: actions([
    Requesting.respond,
    {
      request,
      apiKey,
    },
  ]),
});
