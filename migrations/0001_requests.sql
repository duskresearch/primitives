-- Ideas on the /requests board: roadmap seeds and visitors' suggestions.
CREATE TABLE suggestions (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  detail      TEXT,
  primitive   TEXT,                      -- slug of the primitive it would join; NULL for a new primitive
  normalized  TEXT NOT NULL,             -- for spotting repeats (src/lib/requests.ts)
  status      TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'held', 'hidden')),
  reason      TEXT,                      -- why a suggestion was held
  source      TEXT NOT NULL,             -- 'roadmap', or the page a visitor suggested it from
  votes       INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,          -- unix seconds
  author      TEXT                       -- salted hash of the visitor, never the address
);
CREATE UNIQUE INDEX suggestions_unique ON suggestions (normalized, coalesce(primitive, ''));
CREATE INDEX suggestions_board ON suggestions (status, votes DESC, created_at DESC);

-- One row per visitor per idea; `suggestions.votes` is kept equal to the count here.
CREATE TABLE votes (
  suggestion_id TEXT NOT NULL REFERENCES suggestions (id) ON DELETE CASCADE,
  voter         TEXT NOT NULL,           -- salted hash of network address and browser
  created_at    INTEGER NOT NULL,
  PRIMARY KEY (suggestion_id, voter)
);

-- Everything typed into a request form, with what became of it: demand for planned
-- instruments shows up here even though they are not on the board.
CREATE TABLE requests (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  text          TEXT NOT NULL,
  detail        TEXT,
  primitive     TEXT,
  page          TEXT,
  outcome       TEXT NOT NULL,           -- new, held, repeat, planned, live, refused
  reason        TEXT,
  suggestion_id TEXT,
  created_at    INTEGER NOT NULL,
  author        TEXT
);

CREATE TABLE subscribers (
  email       TEXT PRIMARY KEY,
  created_at  INTEGER NOT NULL,
  page        TEXT,
  country     TEXT
);

-- Fixed-window counters for rate limits, keyed by action and hashed visitor.
CREATE TABLE rate_limits (
  key     TEXT NOT NULL,
  window  INTEGER NOT NULL,
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window)
);
