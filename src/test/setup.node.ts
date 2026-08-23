import { beforeEach, vi } from "vitest";

/**
 * Global mocks for the `node` project.
 *
 * All 43 route modules call `connectDB()` at module scope. The real
 * implementation registers a connection `error` listener that calls
 * `process.exit()` -- which would take down the Vitest worker -- and adds a new
 * listener per call. Mocking it here removes both, plus any chance of a test
 * reaching a real database.
 */
vi.mock("@/dbConfig/connectDB", () => ({
    connectDB: vi.fn(async () => undefined),
}));

/** Clerk's server entrypoint throws outside a request context. */
vi.mock("@clerk/nextjs/server", () => ({
    auth: vi.fn(() => ({ userId: null, sessionId: null })),
    currentUser: vi.fn(async () => null),
    clerkClient: {
        users: {
            updateUserMetadata: vi.fn(async () => ({})),
            getUser: vi.fn(async () => ({ id: "user_2clerkA" })),
            deleteUser: vi.fn(async () => ({})),
        },
    },
    clerkMiddleware: vi.fn(),
    createRouteMatcher: vi.fn(() => () => false),
}));

/**
 * Installed per-test, not at module top level: `restoreMocks: true` restores
 * spies after each test, so a top-level spy would vanish after the first one.
 */
beforeEach(() => {
    // Tripwire -- if anything reaches the real connectDB error path, fail the
    // test loudly instead of killing the worker with a confusing exit.
    vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
        throw new Error(`process.exit(${code}) was called during a test`);
    }) as never);

    // Handlers console.log on every catch; keep output readable.
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
});
