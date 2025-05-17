/**
 * Robustly parse model output containing JSON with potential formatting issues.
 * Strips prefixes/suffixes, normalizes quotes, removes comments/trailing commas,
 * wraps unquoted emoji values, and ensures keys are quoted before parsing.
 */
export function parseModelOutput(raw: string): any {
  let text = raw.trim();

  // Extract the first JSON substring (array or object)
  const match = text.match(/([\[{][\s\S]*[\]}])/);
  text = match ? match[1] : text;

  // Normalize smart quotes
  text = text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

  // Strip BOM if present
  text = text.replace(/^\uFEFF/, '');

  // Remove control characters
  text = text.replace(/[\u0000-\u001F]+/g, '');

  // Remove JavaScript-style comments
  text = text.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove trailing commas before } or ]
  text = text.replace(/,(?=\s*?[\}\]])/g, '');

  // Fix stray colon before emoji labels
  text = text.replace(/"emoji"\s*:\s*":/g, '"emoji":"');

  // Wrap unquoted emoji values in quotes
  text = text.replace(
    /("emoji"\s*:\s*)([^\s",\}\]]+)/g,
    '$1"$2"'
  );

  // Ensure object keys are quoted
  text = text.replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');

  // Parse cleaned JSON text
  return JSON.parse(text);
}
