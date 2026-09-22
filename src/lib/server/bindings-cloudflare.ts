import { env } from 'cloudflare:workers';

export function bindings(_locals: App.Locals, request: Request) {
  return { db: env.DB, salt: env.VOTE_SALT, ip: request.headers.get('cf-connecting-ip') };
}
