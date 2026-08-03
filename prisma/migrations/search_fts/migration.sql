CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_note_fts ON "Note"
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

CREATE INDEX IF NOT EXISTS idx_note_visibility ON "Note" ("isPublished", "authorId");

CREATE INDEX IF NOT EXISTS idx_user_name_trgm ON "User" USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_user_username_trgm ON "User" USING GIN (username gin_trgm_ops);
