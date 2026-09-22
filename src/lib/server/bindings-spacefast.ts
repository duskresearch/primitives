// The Astro adapter passes the Functions environment on each request, not globally.
export function bindings(locals: App.Locals, request: Request) {
  const env = locals.runtime?.env;
  if (env?.PRIMITIVES_SPACEFAST_BACKEND_READY !== 'verified') {
    throw new Error('Spacefast backend disabled until trusted IP and SQL broker contracts are verified');
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (!env.DB || !env.VOTE_SALT || !ip) throw new Error('Spacefast backend requires DB, VOTE_SALT, and trusted visitor IP');
  return { db: env.DB, salt: env.VOTE_SALT, ip };
}
