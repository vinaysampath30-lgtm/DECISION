/**
 * Presentation helpers. Deliberately no invented metrics — anything shown to the
 * user either comes from the provider response or is explicitly labelled as an
 * engine-generated heuristic.
 */

const IMAGE_ENDPOINT = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image';

/**
 * Image resolution order:
 *  1. a real provider image URL (Qloo) when available,
 *  2. a generated illustration for demo-catalogue entities (clearly not a
 *     provider asset),
 *  3. a monogram tile rendered by the component when the image fails.
 */
export const resolveEntityImage = (entity, { mode } = {}) => {
  if (!entity) return null;
  if (entity.image) return entity.image;
  if (entity.source === 'demo' || mode === 'demo') {
    const prompt = [
      entity.name,
      entity.categoryLabel || entity.category,
      'editorial illustration, cinematic lighting, deep navy and violet palette, no text',
    ]
      .filter(Boolean)
      .join(', ');
    return `${IMAGE_ENDPOINT}?prompt=${encodeURIComponent(prompt)}&image_size=landscape_4_3`;
  }
  return null;
};

export const initials = (name) =>
  String(name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('') || '?';

export const formatDuration = (ms) => {
  if (!Number.isFinite(ms)) return '—';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)} s`;
};

export const formatRelativeTime = (iso) => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
};

export const sourceLabel = (source) =>
  source === 'qloo' ? 'Qloo' : source === 'demo' ? 'Demo catalogue' : 'Unknown source';

export const titleCase = (value) =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
