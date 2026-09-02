const BASE = '/api';

async function req(path, options) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getIndustries: () => req('/industries'),
  getIndustry: (key) => req(`/${key}`),
  dispatch: (key, orderId, resourceId) =>
    req(`/${key}/dispatch`, { method: 'POST', body: JSON.stringify({ orderId, resourceId }) }),
  advanceTask: (key, taskId) =>
    req(`/${key}/tasks/${taskId}/advance`, { method: 'POST' }),
};
