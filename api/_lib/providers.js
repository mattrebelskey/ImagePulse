// Provider registry for BYOK keys (key-PER-PROVIDER from day one — pricing
// decision #2). Gemini ships first; adding a generator later means adding an
// entry here plus a row in the Settings page registry — no route changes.
// Each validateKey() makes the cheapest real call the provider offers and
// returns { ok } or { ok: false, transient, reason }. `transient` separates
// provider outage (502 to the client, retryable) from a rejected key (400).
// Keys travel in headers, never URLs, so they cannot land in request logs.
export const PROVIDERS = {
  gemini: {
    label: 'Google Gemini',
    async validateKey(key) {
      let response;
      try {
        response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1', {
          headers: { 'x-goog-api-key': key },
        });
      } catch {
        return { ok: false, transient: true, reason: 'Could not reach Google to validate the key. Please try again in a moment.' };
      }
      if (response.ok) return { ok: true };
      if (response.status >= 500) {
        return { ok: false, transient: true, reason: 'Google had an error while validating the key. Please try again in a moment.' };
      }
      return { ok: false, transient: false, reason: 'Google rejected this API key. Check that you copied the full key from aistudio.google.com/apikey and that it is active.' };
    },
  },
};
