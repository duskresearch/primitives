/** A form post as a plain object, whether it came as JSON or as an HTML form. */
export async function readBody(request: Request): Promise<{ data: Record<string, unknown>; json: boolean }> {
  const json = (request.headers.get('content-type') ?? '').includes('application/json');
  if (json) return { data: ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>, json };
  const form = await request.formData().catch(() => null);
  return { data: form ? Object.fromEntries(form) : {}, json };
}

/** JSON for scripts; for a form posted without JavaScript, go back to the page it came from. */
export function answer(request: Request, json: boolean, data: Record<string, unknown>, status: number): Response {
  if (json) return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
  const back = new URL(request.headers.get('referer') ?? '/', request.url);
  return Response.redirect(new URL(back.pathname, request.url).href, 303);
}
