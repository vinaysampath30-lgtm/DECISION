/**
 * Thin API client. Every request goes to the Express backend — the Qloo API key
 * never reaches the browser and is not stored in localStorage.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiUrl = (path) => `${BASE_URL}${path}`;

const parseError = async (response) => {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  const error = new Error(
    payload?.error?.message || `Request failed with status ${response.status}`,
  );
  error.code = payload?.error?.code || 'REQUEST_FAILED';
  error.status = response.status;
  error.details = payload?.error?.details;
  return error;
};

const jsonRequest = async (path, options = {}) => {
  const response = await fetch(apiUrl(path), {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) throw await parseError(response);
  return response.json();
};

export const getHealth = () => jsonRequest('/api/health');
export const getOptions = () => jsonRequest('/api/options');

export const searchEntities = ({ query, types = [], signal }) =>
  jsonRequest('/api/search', {
    method: 'POST',
    body: JSON.stringify({ query, types }),
    signal,
  });

export const recommendOnce = (body, { signal } = {}) =>
  jsonRequest('/api/recommend', {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  });

/**
 * Streams real workflow progress from POST /api/recommend/stream.
 * The endpoint emits newline-delimited JSON events, so we can show genuine
 * stage transitions rather than a canned animation.
 */
export const streamRecommend = async (body, { onEvent, signal } = {}) => {
  const response = await fetch(apiUrl('/api/recommend/stream'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) throw await parseError(response);

  if (!response.body || typeof response.body.getReader !== 'function') {
    const error = new Error('This browser cannot read streamed responses.');
    error.code = 'STREAM_UNSUPPORTED';
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const emit = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      onEvent?.(JSON.parse(trimmed));
    } catch {
      /* ignore malformed frame */
    }
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex = buffer.indexOf('\n');
    while (newlineIndex >= 0) {
      emit(buffer.slice(0, newlineIndex));
      buffer = buffer.slice(newlineIndex + 1);
      newlineIndex = buffer.indexOf('\n');
    }
  }

  emit(buffer);
};
