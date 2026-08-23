import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The one place mongoose itself is mocked. Everywhere else connectDB is stubbed
 * out globally (src/test/setup.node.ts) because all 43 route modules call it at
 * import time and the real implementation calls process.exit() on a connection
 * error -- which would kill the Vitest worker.
 */
// setup.node.ts mocks @/dbConfig/connectDB for every node test. This is the one
// file that needs the real thing, so opt back out of that global mock.
vi.unmock("@/dbConfig/connectDB");

vi.mock("mongoose", () => {
    const connection = {
        on: vi.fn(),
        once: vi.fn(),
    };
    return {
        default: { connect: vi.fn(), connection },
        connect: vi.fn(),
        connection,
    };
});

import mongoose from "mongoose";

// connectDB.ts has no import-time side effects, so the module can be shared;
// resetting the registry here would hand back a different mongoose mock than
// the one asserted on above.
const loadFresh = async () => import("./connectDB");

beforeEach(() => {
    vi.mocked(mongoose.connect).mockReset();
    vi.mocked(mongoose.connection.on).mockReset();
});

describe("connectDB", () => {
    it("connects using MONGO_URI", async () => {
        const { connectDB } = await loadFresh();

        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
    });

    it("registers a connection error handler", async () => {
        const { connectDB } = await loadFresh();

        await connectDB();

        expect(mongoose.connection.on).toHaveBeenCalledWith(
            "error",
            expect.any(Function)
        );
    });

    /**
     * The error handler calls process.exit(). setup.node.ts replaces exit with
     * a throwing spy so this is observable instead of fatal -- and so a stray
     * real connection in another test fails loudly rather than killing the run.
     */
    it("exits the process when the connection errors", async () => {
        const { connectDB } = await loadFresh();
        await connectDB();

        const handler = vi
            .mocked(mongoose.connection.on)
            .mock.calls.find(([event]) => event === "error")![1] as Function;

        expect(() => handler(new Error("connection refused"))).toThrow(
            /process\.exit/
        );
    });

    /**
     * connectDB is invoked at module scope by every route file and adds a new
     * listener each time, with no cached-connection guard. On a warm serverless
     * container this accumulates listeners.
     * Characterizing current behavior.
     */
    it("adds another listener on every call rather than reusing one connection", async () => {
        const { connectDB } = await loadFresh();

        await connectDB();
        await connectDB();
        await connectDB();

        expect(mongoose.connection.on).toHaveBeenCalledTimes(3);
        expect(mongoose.connect).toHaveBeenCalledTimes(3);
    });

    it("swallows a synchronous connect failure instead of rejecting", async () => {
        vi.mocked(mongoose.connect).mockImplementation(() => {
            throw new Error("bad uri");
        });
        const { connectDB } = await loadFresh();

        // The try/catch only logs, so callers cannot detect the failure.
        await expect(connectDB()).resolves.toBeUndefined();
    });

    it("does not await the connection, so it resolves before mongo is ready", async () => {
        let resolveConnect: () => void;
        vi.mocked(mongoose.connect).mockReturnValue(
            new Promise<void>((r) => {
                resolveConnect = r;
            }) as any
        );
        const { connectDB } = await loadFresh();

        // Resolves immediately despite the pending connection promise.
        await expect(connectDB()).resolves.toBeUndefined();
        resolveConnect!();
    });
});
