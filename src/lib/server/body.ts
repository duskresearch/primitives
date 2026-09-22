/** A form post as a plain object, whether it came as JSON or as an HTML form. */
export async function readBody(request: Request): Promise<{ data: Record<string, unknown>; json: boolean }> {
  const json = (request.headers.get('content-type') ?? '').includes('application/json');
  if (json) {
    const value: unknown = await request.json().catch(() => ({}));
    return { data: value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}, json };
  }
  const form = await request.formData().catch(() => null);
  return { data: form ? Object.fromEntries(form) : {}, json };
}

/** Reject oversized submissions before parsing, including chunked requests. */
export async function boundedRequest(request: Request, limit = 8192): Promise<Request | null> {
  const length = Number(request.headers.get('content-length'));
  if (Number.isFinite(length) && length > limit) return null;
  const reader = request.body?.getReader();
  if (!reader) return request;
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); return null; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new Request(request, { body: bytes });
}

/** JSON for scripts; for a form posted without JavaScript, go back to the page it came from. */
export function answer(request: Request, json: boolean, data: Record<string, unknown>, status: number): Response {
  if (json) return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
  let path = '/';
  try {
    const back = new URL(request.headers.get('referer') ?? '/', request.url);
    if (back.origin === new URL(request.url).origin) path = back.pathname;
  } catch { /* Invalid referer returns home. */ }
  return Response.redirect(new URL(path, request.url).href, 303);
}
