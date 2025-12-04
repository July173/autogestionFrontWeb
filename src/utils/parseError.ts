/**
 * Utilities to normalize backend error messages.
 * Given an Error, string, or raw response text, try to extract a human-friendly message.
 */
export function parseErrorMessage(input: unknown): string {
  if (!input && input !== 0) return '';
  let txt: string;
  if (input instanceof Error) txt = input.message || '';
  else if (typeof input === 'string') txt = input;
  else {
    try {
      txt = JSON.stringify(input);
    } catch {
      txt = String(input);
    }
  }

  txt = txt.trim();

  // Try to parse JSON payloads first
  if (txt.startsWith('{') || txt.startsWith('[')) {
    try {
      const parsed = JSON.parse(txt);
      if (!parsed) return txt;
      if (typeof parsed === 'string') return parsed;
      // prefer common keys
      if (parsed.detail) return String(parsed.detail);
      if (parsed.message) return String(parsed.message);
      if (parsed.error) return String(parsed.error);
      // If it's an object with one property whose value is a string, return that
      const keys = Object.keys(parsed);
      if (keys.length === 1 && typeof parsed[keys[0]] === 'string') return String(parsed[keys[0]]);
    } catch (_err) {
      // fall through to regex cleaning
    }
  }

  // Try to extract detail: "..." or 'detail': '...' patterns
  const detailRegex = /["']?detail["']?\s*[:=]\s*["']([^"']+)["']/i;
  const m = txt.match(detailRegex);
  if (m && m[1]) return m[1];

  // Remove surrounding braces and quotes and remove leading 'detail:' if present
  let cleaned = txt.replace(/^[\s{["']+|[\s}\]"]+$/g, '').trim();
  cleaned = cleaned.replace(/^detail\s*[:=]\s*/i, '');
  // Trim any enclosing quotes
  cleaned = cleaned.replace(/^['"]|['"]$/g, '').trim();

  return cleaned || txt;
}

export default parseErrorMessage;
