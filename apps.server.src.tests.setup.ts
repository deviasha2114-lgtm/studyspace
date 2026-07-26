// apps/server/src/tests/setup.ts
// QA-03 — Supertest integration test helpers
//
// Exports:
//   createTestUser(role?)   → creates a user row in the test DB, returns the full record
//   getAuthToken(userId)    → signs a JWT for that user (same logic as production)
//   cleanDatabase()         → wipes all rows in dependency-safe order (no FK violations)
//
// Usage in a test file:
//   import { createTestUser, getAuthToken, cleanDatabase } from '@tests/setup';
//
//   beforeAll(async () => { await cleanDatabase(); });
//   afterAll(async () => { await cleanDatabase(); await prisma.$disconnect(); });
//
//   it('returns 200 for owner', async () => {
//     const user = await createTestUser('STUDENT');
//     const token = await getAuthToken(user.id);
//     const res = await request(app)
//       .get(`/api/sets/${set.id}`)
//       .set('Authorization', `Bearer ${token}`);
//     expect(res.status).toBe(200);
//   });

import { PrismaClient, Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// ── Prisma singleton for tests ─────────────────────────────────────────────────
// A single PrismaClient is reused across helpers to avoid exhausting the
// connection pool. Each test FILE gets its own process (pool: 'forks') so this
// singleton is not shared between files.
export const prisma = new PrismaClient({
  datasources: {
    db: {
      // Must be set in .env.test — never the production DATABASE_URL
      url: process.env.DATABASE_URL,
    },
  },
  // Suppress query logs during tests; set LOG_LEVEL=query to see them
  log: process.env.LOG_LEVEL === 'query' ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

// ── Environment guard ──────────────────────────────────────────────────────────
// Blow up loudly if someone accidentally points at the production DB
if (!process.env.DATABASE_URL?.includes('_test')) {
  throw new Error(
    '[test setup] DATABASE_URL does not contain "_test". ' +
    'Refusing to run integration tests against a non-test database. ' +
    'Set DATABASE_URL=postgresql://...studyspace_test in .env.test'
  );
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-32-chars-minimum!!xx';
const JWT_EXPIRES_IN = '1h';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface TestUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: Role;
  // No passwordRaw — OAuth-only platform; there are no passwords in the schema
}

// ── createTestUser ─────────────────────────────────────────────────────────────
/**
 * Creates a user in the test database via OAuth-compatible fields only.
 * No password is set — StudySpace is an OAuth-only platform.
 *
 * @param role      Prisma Role enum value — defaults to 'STUDENT'
 * @param overrides Optional partial fields: email, name (→ displayName)
 * @returns         The created Prisma User record
 *
 * @example
 *   const student = await createTestUser('STUDENT');
 *   const admin   = await createTestUser('ADMIN', { name: 'Admin Alice' });
 */
export async function createTestUser(
  role: Role = 'STUDENT',
  overrides: Partial<{ email: string; name: string }> = {}
): Promise<TestUser> {
  const uid = uuidv4();

  const user = await prisma.user.create({
    data: {
      email: overrides.email ?? `test-${uid}@studyspace.test`,
      username: `test_${uid.slice(0, 8)}`,                   // unique, required
      displayName: overrides.name ?? `Test User ${uid.slice(0, 6)}`,
      emailVerified: new Date(),                              // treat as verified
      role,
    },
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
}

// ── getAuthToken ───────────────────────────────────────────────────────────────
/**
 * Signs a JWT for the given userId using the same secret + payload shape
 * as the production auth service.  Pass the token in Authorization headers:
 *   .set('Authorization', `Bearer ${token}`)
 *
 * @param userId  The user's UUID (from createTestUser().id)
 * @param role    Role to embed in the token (defaults to 'STUDENT')
 * @param expiresIn  Override expiry for expired-token tests (e.g. '-1s')
 */
export function getAuthToken(
  userId: string,
  role: Role = 'STUDENT',
  expiresIn: string = JWT_EXPIRES_IN
): string {
  return jwt.sign(
    {
      sub: userId,
      role,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    { expiresIn }
  );
}

/**
 * Returns an EXPIRED token — useful for testing 401 responses on stale sessions.
 */
export function getExpiredToken(userId: string, role: Role = 'STUDENT'): string {
  return getAuthToken(userId, role, '-1s');
}

// ── cleanDatabase ──────────────────────────────────────────────────────────────
/**
 * Deletes all rows from every table in FK-safe order (leaf → root).
 * Matches the actual StudySpace schema — update this list whenever a new
 * model is added to schema.prisma.
 *
 * Call in beforeAll / afterAll at file scope, NOT afterEach (too slow).
 */
export async function cleanDatabase(): Promise<void> {
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.moderationLog.deleteMany(),
    prisma.report.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversationParticipant.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.liveSessionParticipant.deleteMany(),
    prisma.liveSession.deleteMany(),
    prisma.noteLike.deleteMany(),
    prisma.note.deleteMany(),
    prisma.communityMember.deleteMany(),
    prisma.community.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.user.deleteMany(),           // root — always last
  ]);
}

// ── Global teardown ────────────────────────────────────────────────────────────
// Vitest calls afterAll at file scope automatically.
// Disconnect Prisma so the worker process exits cleanly.
afterAll(async () => {
  await prisma.$disconnect();
});
