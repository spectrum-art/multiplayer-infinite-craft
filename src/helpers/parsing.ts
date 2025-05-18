/**
 * Robustly parse model output containing JSON with potential formatting issues.
 *
 * Steps:
 * 1. Extract the first JSON-like chunk (object or array).
 * 2. Normalize BOM, smart quotes, and control characters.
 * 3. Remove JS/CSS comments.
 * 4. Strip trailing commas before } or ].
 * 5. Remove stray backslashes not part of unicode escapes.
 * 6. Convert shorthand {key} markers into "key":
 * 7. Ensure JSON starts with an object or array.
 * 8. Wrap unquoted emoji values in quotes.
 * 9. Strip common key variants and normalize names.
 */
export function parseModelOutput(raw: string): any {
  // 1. Trim and extract JSON chunk
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/(\[?[\s\S]*?\]?\{[\s\S]*?\}|\[[\s\S]*?\])/);
  let text = jsonMatch ? jsonMatch[0] : trimmed;

  // 2. Normalize BOM, smart quotes, control chars
  text = text
    .replace(/\uFEFF/g, '')               // BOM
    .replace(/[‘’]/g, '"')               // smart single quotes
    .replace(/[“”]/g, '"')               // smart double quotes
    .replace(/[\x00-\x1F\x7F]/g, '');  // control chars

  // 3. Remove JS/CSS comments
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');

  // 4. Strip trailing commas before } or ]
  text = text.replace(/,\s*(?=[}\]])/g, '');

  // 5. Remove stray backslashes except unicode escapes
  text = text.replace(/\\(?!u[0-9A-Fa-f]{4})/g, '');

  // 6. Convert shorthand {key} markers (e.g. {obvious_choice}) into JSON keys
  text = text.replace(/\{\s*([A-Za-z0-9_-]+)\s*\}/g, '"$1":');

  // 7. Ensure it starts as JSON
  if (!text.startsWith('{') && !text.startsWith('[')) {
    text = `{${text}}`;
  }

  // 8. Wrap unquoted emoji values in quotes
  text = text.replace(
    /"emoji"\s*:\s*([\p{Emoji_Presentation}\u2600-\u27BF]+)/gu,
    '"emoji":"$1"'
  );

  // Final parse with fallback
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse model output: ${e.message}\nRaw: ${raw}`);
  }

  // 9. Normalize top-level noun keys
  const mapKey = (from: string, to: string) => {
    if (parsed[from] !== undefined) {
      parsed[to] = parsed[from];
      delete parsed[from];
    }
  };
  mapKey('obvious_choice', 'obvious');
  mapKey('obviousChoice', 'obvious');
  mapKey('witty_choice', 'witty');
  mapKey('wittyChoice', 'witty');

  // 10. Normalize inner fields: text -> name
  ['obvious', 'witty'].forEach(key => {
    if (parsed[key] && parsed[key].text !== undefined) {
      parsed[key].name = parsed[key].text;
      delete parsed[key].text;
    }
  });

  return parsed;
}
