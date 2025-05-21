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
  const firstBrace = raw.indexOf('{'), firstBracket = raw.indexOf('[');
  const start = firstBrace >= 0 && (firstBrace < firstBracket || firstBracket < 0) ? firstBrace : firstBracket;
  const end = Math.max(raw.lastIndexOf('}'), raw.lastIndexOf(']'));
  if (start >= 0 && end > start) text = raw.slice(start, end + 1);

  // 2. Remove leading/trailing non-JSON garbage
  text = text.replace(/^[^\[{]*/, '').replace(/[^\]}]*$/, '');

  // 3. Normalize BOM, smart quotes, control chars, and single quotes
  text = text
    .replace(/\uFEFF/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\r?\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\'([^']*)\'/g, '"$1"'); // single to double quotes

  // 4. Remove JS/CSS comments
  text = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  // 5. Strip trailing commas before } or ]
  text = text.replace(/,\s*(?=[\}\]])/g, '');

  // 6. Remove stray backslashes before braces or quotes
  text = text.replace(/\\(?=[{}\[\]"])/g, '');

  // 7. Convert shorthand {key} markers to "key":
  text = text.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, '"$1":');

  // 8. Wrap unquoted emoji values in quotes
  text = text.replace(/("emoji"\s*:\s*)([\p{Emoji}\u2600-\u27BF]+)/gu, '$1"$2"');

  // 9. Repair stray colon typos in emoji fields
  text = text.replace(/"emoji"\s*:\s*":/g, '"emoji":"');

  // 10. Fix unescaped double quotes inside values
  text = text.replace(/: "([^"]*)"([,}])/g, (m, val, end) => ': "' + val.replace(/"/g, '\\"') + '"' + end);

  // 11. If not wrapped in braces, wrap as JSON object
  if (!/^\s*[\[{]/.test(text)) text = '{' + text + '}';

  // 12. Parse JSON, fallback to default if error
  let parsed;
  try {
    parsed = JSON.parse(text.trim());
  } catch (e: any) {
    // Fallback: always return a consistent object
    return {
      obvious: { name: 'Unknown', emoji: '❓' },
      witty: { name: 'Unknown', emoji: '❓' },
      _error: `Failed to parse model output: ${e.message}`
    };
  }

  // 13. Normalize key names
  [ ['obvious_choice','obvious'], ['obviousChoice','obvious'], ['witty_choice','witty'], ['wittyChoice','witty'] ].forEach(([from,to]) => {
    if (parsed[from] !== undefined) { parsed[to] = parsed[from]; delete parsed[from]; }
  });
  ['obvious','witty'].forEach(key => {
    const obj = parsed[key];
    if (obj) {
      if (obj.text !== undefined) { obj.name = obj.text; delete obj.text; }
      if (typeof obj.emoji !== 'string') obj.emoji = String(obj.emoji);
      if (!obj.name) obj.name = 'Unknown';
      if (!obj.emoji) obj.emoji = '❓';
    } else {
      parsed[key] = { name: 'Unknown', emoji: '❓' };
    }
  });
  return parsed;
}
