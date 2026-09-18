// Server bindings (wrangler.jsonc), declared by hand: `wrangler types` would also declare the
// Workers runtime's own globals (Element, Response…), which clash with DOM types in client code.
declare namespace App {
  interface Locals {
    /** The field this request is for, from its host (src/middleware.ts). */
    field: import('./lib/fields').Field;
  }
}

declare module 'cloudflare:workers' {
  export const env: {
    DB: D1Database;
    /** Salts the hashes that stand in for visitors. A secret in production, .dev.vars locally. */
    VOTE_SALT?: string;
  };
}

interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(column?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}
