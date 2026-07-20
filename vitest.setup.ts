/** Dummy URL so importing `lib/db/*` does not throw during unit tests. */
process.env.DATABASE_URL ??=
  "postgresql://test:test@127.0.0.1:5432/gamesunder10_test";
