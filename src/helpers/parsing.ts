/**
 * Robustly parse model output containing JSON with potential formatting issues.
 *
 * Steps:
 * 1. Extract first JSON-like chunk (object or array).
 * 2. Normalize smart quotes, remove BOM & control chars.
 * 3. Remove JS-style comments.
 * 4. Strip trailing commas before } or ].
 * 5. Remove stray backslashes before braces/quotes.
 * 6. Convert shorthand property markers {key} to proper JSON keys.
 * 7. Remove prefixes and suffixes outside of the JSON chunk.
 * 8. Wrap unquoted emoji values in quotes.
 */
export function parseModelOutput(raw: string): any {
  // 1. Trim and extract the core JSON-like substring
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/(\[?[\s\S]*?\]?|\{[\s\S]*?\})/);
  let text = jsonMatch ? jsonMatch[0] : trimmed;

  // 2. Normalize Unicode BOM, smart quotes, control chars
  text = text
    .replace(/\uFEFF/g, '')                // BOM
    .replace(/[‘’]/g, "'")                // smart single quotes
    .replace(/[“”]/g, '"')                // smart double quotes
    .replace(/[\x00-\x1F\x7F]/g, '');    // control chars

  // 3. Remove JavaScript/CSS style comments
  text = text.replace(/\/\/.*(?=[\n\r])|\/\*[\s\S]*?\*\//g, '');

  // 4. Strip trailing commas before } or ]
  text = text.replace(/,\s*(?=[}\]])/g, '');

  // 5. Remove stray backslashes before braces or quotes
  text = text.replace(/\\(?=[{}\[\]"])/g, '');

  // 6. Convert shorthand {key} markers to "key":
  text = text.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, '"$1":');

  // 7. Ensure it's a single JSON object or array
  if (!text.startsWith('{') && !text.startsWith('[')) {
    text = `{${text}}`;
  }

  // 8. Wrap unquoted emoji values in quotes (e.g., "emoji": 🙏)
  text = text.replace(
    /("emoji"\s*:\s*)([\p{Emoji}_+\-\u2600-\u27BF]+)/gu,
    '$1"$2"'
  );

  // Final parse
  return JSON.parse(text);
}
