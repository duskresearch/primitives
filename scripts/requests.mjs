// Review the /requests board from the terminal. Local D1 by default; add --remote for
// production.
//
//   npm run requests -- held                 ideas waiting for review
//   npm run requests -- live                 the board as visitors see it
//   npm run requests -- log [n]              the last n submissions and what became of them
//   npm run requests -- approve <id>         put a held idea on the board
//   npm run requests -- hide <id>            take an idea off the board (votes are kept)
//   npm run requests -- subscribers          the email list
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const remote = args.includes('--remote');
const [command, arg] = args.filter((a) => a !== '--remote');
const id = (arg ?? '').replace(/[^a-z0-9-]/gi, '');

const sql = {
  held: "SELECT id, name, detail, primitive, reason, datetime(created_at, 'unixepoch') AS at FROM suggestions WHERE status = 'held' ORDER BY created_at DESC",
  live: "SELECT id, name, primitive, votes, source FROM suggestions WHERE status = 'live' ORDER BY votes DESC, created_at DESC",
  log: `SELECT datetime(created_at, 'unixepoch') AS at, outcome, reason, text, primitive, page FROM requests ORDER BY id DESC LIMIT ${Number(arg) || 30}`,
  approve: `UPDATE suggestions SET status = 'live', reason = NULL WHERE id = '${id}' RETURNING id, name, status`,
  hide: `UPDATE suggestions SET status = 'hidden' WHERE id = '${id}' RETURNING id, name, status`,
  subscribers: "SELECT email, datetime(created_at, 'unixepoch') AS at, page, country FROM subscribers ORDER BY created_at DESC",
}[command];

if (!sql || ((command === 'approve' || command === 'hide') && !id)) {
  console.log('Usage: npm run requests -- <held | live | log [n] | approve <id> | hide <id> | subscribers> [--remote]');
  process.exit(1);
}
const out = execFileSync('npx', ['wrangler', 'd1', 'execute', 'primitives', remote ? '--remote' : '--local', '--json', '--command', sql], { encoding: 'utf8' });
const rows = JSON.parse(out)[0]?.results ?? [];
console.table(rows);
