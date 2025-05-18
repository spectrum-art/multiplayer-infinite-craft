/**
 * Robustly parse model output containing JSON with potential formatting issues.
 *
 * Steps:
 * 1. Extract the substring between the first { or [ and its matching } or ].
 * 2. Normalize BOM, smart quotes, and control chars.
 * 3. Remove JS/CSS comments.
 * 4. Strip trailing commas before } or ].
 * 5. Remove stray backslashes not part of unicode escapes.
 * 6. Convert shorthand {key} markers into proper JSON keys.
 * 7. Wrap unquoted emoji values in quotes.
 * 8. Repair common typos (stray colons, missing quotes) in emoji fields.
 * 9. Parse JSON.
 * 10. Normalize top-level keys and sub-keys to expected schema.
 */
export function parseModelOutput(raw: string): any {
  let text = raw;

  // 1. Extract JSON slice between first { or [ and last } or ]
  const firstBrace = raw.indexOf('{');
  const firstBracket = raw.indexOf('[');
  const start = firstBrace >= 0 && (firstBrace < firstBracket || firstBracket < 0)
    ? firstBrace
    : firstBracket;
  const endBrace = raw.lastIndexOf('}');
  const endBracket = raw.lastIndexOf(']');
  const end = endBracket > endBrace ? endBracket : endBrace;
  if (start >= 0 && end > start) {
    text = raw.slice(start, end + 1);
  }

  // 2. Normalize BOM, smart quotes, control chars
  text = text
    .replace(/\uFEFF/g, '')        // BOM
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // smart double quotes
    .replace(/[\x00-\x1F\x7F]/g, ''); // control chars

  // 3. Remove JS/CSS comments
  text = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  // 4. Strip trailing commas before } or ]
  text = text.replace(/,\s*(?=[\}\]])/g, '');

  // 5. Remove stray backslashes before braces or quotes
  text = text.replace(/\\(?=[{}\[\]"])/g, '');

  // 6. Convert shorthand {key} markers to "key":
  text = text.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, '"$1":');

  // 7. Wrap unquoted emoji values in quotes
  text = text.replace(/("emoji"\s*:\s*)([\p{Emoji}\u2600-\u27BF]+)/gu, '$1"$2"');

  // 8. Repair stray colon typos in emoji fields
  text = text.replace(/"emoji"\s*:\s*":/g, '"emoji":"');

  // 9. Parse JSON
  let parsed: any;
  try {
    parsed = JSON.parse(text.trim());
  } catch (e) {
    throw new Error(`Failed to parse model output: ${e.message}\nRaw: ${raw}`);
  }

  // 10. Normalize key names
  function mapKey(from: string, to: string) {
    if (parsed[from] !== undefined) {
      parsed[to] = parsed[from]; delete parsed[from];
    }
  }
  // top-level choices
  mapKey('obvious_choice', 'obvious');
  mapKey('obviousChoice', 'obvious');
  mapKey('witty_choice', 'witty');
  mapKey('wittyChoice', 'witty');

  // sub-keys: ensure 'name' and 'emoji'
  ['obvious', 'witty'].forEach(key => {
    const obj = parsed[key];
    if (obj) {
      // rename 'text' to 'name'
      if (obj.text !== undefined) {
        obj.name = obj.text; delete obj.text;
      }
      // ensure emoji is string
      if (typeof obj.emoji !== 'string') {
        obj.emoji = String(obj.emoji);
      }
    }
  });

  return parsed;
}
