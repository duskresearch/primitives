import type { Operation, Result } from './operations';
export const remoteBinding = () => false;
export { isIdea } from './bridge-site';
export async function remote(_operation: Operation, _request: Request, _locals: App.Locals, _data: Record<string, unknown>): Promise<Result> {
  throw new Error('Remote bridge is not part of Cloudflare build');
}
