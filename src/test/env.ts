/**
 * First setup file for every project. Runs before any other setup file and
 * before the test module graph is imported.
 *
 * `src/lib/encryption.ts` captures ENCRYPTION_KEY in a module-scope const, so
 * the value must exist before that module is ever imported. vitest.config.ts's
 * `test.env` already guarantees this; these assertions are the safety net.
 */
const TEST_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef"; // exactly 32 chars

process.env.ENCRYPTION_KEY ||= TEST_ENCRYPTION_KEY;
process.env.MONGO_URI ||= "mongodb://127.0.0.1:27017/fitdose-test-DO-NOT-CONNECT";
process.env.NEXT_PUBLIC_BASE_URL ||= "http://localhost:4000";
process.env.SEED_TOKEN ||= "test-seed-token";
process.env.TOKEN_SECRET ||= "test-token-secret";

if (process.env.ENCRYPTION_KEY.length !== 32) {
    throw new Error(
        `ENCRYPTION_KEY must be exactly 32 chars for tests, got ${process.env.ENCRYPTION_KEY.length}`
    );
}

// The repo's real .env holds a live Atlas URI. If a developer has it exported,
// refuse to run rather than risk a mocking gap touching production data.
if (/mongodb\+srv|mongodb\.net/.test(process.env.MONGO_URI)) {
    throw new Error(
        "Refusing to run tests with a real Atlas MONGO_URI in the environment"
    );
}
