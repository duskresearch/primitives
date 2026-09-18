// Storage for the /requests board (D1). Rules live in src/lib/requests.ts and
// src/lib/moderation; this file only reads and writes.
export interface Idea {
  id: string;
  name: string;
  detail: string | null;
  primitive: string | null;
  source: string;
  votes: number;
  created_at: number;
}

export async function board(db: D1Database, voter: string): Promise<{ ideas: Idea[]; voted: Set<string> }> {
  const [ideas, votes] = await db.batch([
    db.prepare("SELECT id, name, detail, primitive, source, votes, created_at FROM suggestions WHERE status = 'live' ORDER BY votes DESC, created_at DESC, name LIMIT 300"),
    db.prepare('SELECT suggestion_id FROM votes WHERE voter = ?1').bind(voter),
  ]);
  return { ideas: ideas.results as unknown as Idea[], voted: new Set((votes.results as { suggestion_id: string }[]).map((v) => v.suggestion_id)) };
}

export async function idea(db: D1Database, id: string, voter: string): Promise<{ idea: Idea; voted: boolean } | null> {
  const row = await db.prepare("SELECT id, name, detail, primitive, source, votes, created_at FROM suggestions WHERE id = ?1 AND status = 'live'").bind(id).first<Idea>();
  if (!row) return null;
  const voted = await db.prepare('SELECT 1 FROM votes WHERE suggestion_id = ?1 AND voter = ?2').bind(id, voter).first();
  return { idea: row, voted: Boolean(voted) };
}

/** Every idea's normalized name, to find repeats (the board stays small). */
export async function names(db: D1Database) {
  const { results } = await db.prepare('SELECT id, name, normalized, primitive, status FROM suggestions').all<{ id: string; name: string; normalized: string; primitive: string | null; status: string }>();
  return results;
}

export async function insert(db: D1Database, idea: { id: string; name: string; detail: string | null; primitive: string | null; normalized: string; status: 'live' | 'held'; reason?: string; source: string; author: string }) {
  await db
    .prepare('INSERT INTO suggestions (id, name, detail, primitive, normalized, status, reason, source, votes, created_at, author) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 0, unixepoch(), ?9)')
    .bind(idea.id, idea.name, idea.detail, idea.primitive, idea.normalized, idea.status, idea.reason ?? null, idea.source, idea.author)
    .run();
}

/** Add or remove a visitor's vote; `votes` is recounted from the votes table so it stays true. */
export async function vote(db: D1Database, id: string, voter: string, on?: boolean): Promise<{ voted: boolean; votes: number }> {
  const had = Boolean(await db.prepare('SELECT 1 FROM votes WHERE suggestion_id = ?1 AND voter = ?2').bind(id, voter).first());
  const want = on ?? !had;
  const change =
    want && !had
      ? db.prepare('INSERT OR IGNORE INTO votes (suggestion_id, voter, created_at) VALUES (?1, ?2, unixepoch())').bind(id, voter)
      : !want && had
        ? db.prepare('DELETE FROM votes WHERE suggestion_id = ?1 AND voter = ?2').bind(id, voter)
        : null;
  const recount = db.prepare('UPDATE suggestions SET votes = (SELECT count(*) FROM votes WHERE suggestion_id = ?1) WHERE id = ?1 RETURNING votes').bind(id);
  const results = await db.batch(change ? [change, recount] : [recount]);
  const votes = (results.at(-1)!.results[0] as { votes: number } | undefined)?.votes ?? 0;
  return { voted: want, votes };
}

export async function log(db: D1Database, entry: { text: string; detail?: string | null; primitive?: string | null; page?: string | null; outcome: string; reason?: string | null; suggestionId?: string | null; author: string }) {
  await db
    .prepare('INSERT INTO requests (text, detail, primitive, page, outcome, reason, suggestion_id, created_at, author) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, unixepoch(), ?8)')
    .bind(entry.text.slice(0, 200), entry.detail?.slice(0, 200) ?? null, entry.primitive ?? null, entry.page ?? null, entry.outcome, entry.reason ?? null, entry.suggestionId ?? null, entry.author)
    .run();
}
