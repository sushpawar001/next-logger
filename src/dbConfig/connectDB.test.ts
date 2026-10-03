import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The one place mongoose itself is mocked. Everywhere else connectDB is stubbed
 * out globally (src/test/setup.node.ts) because all 43 route modules call it at
 * import time and would otherwise try to reach a real database.
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

// connectDB keeps its cache on globalThis, so each test clears it and gets a
// fresh view of how many times connect/on are called.
const loadFresh = async () => import("./connectDB");
const g = globalThis as any;

beforeEach(() => {
    vi.mocked(mongoose.connect).mockReset();
    vi.mocked(mongoose.connect).mockResolvedValue(mongoose as any);
    vi.mocked(mongoose.connection.on).mockReset();
    delete g.__mongoConnect;
    delete g.__mongoListening;
});

describe("connectDB", () => {
    it("connects using MONGO_URI with a small, fail-fast pool", async () => {
        const { connectDB } = await loadFresh();

        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith(
            process.env.MONGO_URI,
            expect.objectContaining({
                maxPoolSize: 5,
                serverSelectionTimeoutMS: 5_000,
            })
        );
    });

    it("registers a connection error handler", async () => {
        const { connectDB } = await loadFresh();

        await connectDB();

        expect(mongoose.connection.on).toHaveBeenCalledWith(
            "error",
            expect.any(Function)
        );
    });

    it("logs a connection error instead of exiting the process", async () => {
        const { connectDB } = await loadFresh();
        await connectDB();

        const handler = vi
            .mocked(mongoose.connection.on)
            .mock.calls.find(([event]) => event === "error")![1] as Function;

        // setup.node.ts turns process.exit into a throwing spy.
        expect(() => handler(new Error("connection refused"))).not.toThrow();
    });

    it("reuses one connection and one listener across calls", async () => {
        const { connectDB } = await loadFresh();

        await connectDB();
        await connectDB();
        await connectDB();

        expect(mongoose.connection.on).toHaveBeenCalledTimes(1);
        expect(mongoose.connect).toHaveBeenCalledTimes(1);
    });

    it("shares an in-flight connection between concurrent callers", async () => {
        let resolveConnect: () => void;
        vi.mocked(mongoose.connect).mockReturnValue(
            new Promise((r) => {
                resolveConnect = () => r(mongoose as any);
            }) as any
        );
        const { connectDB } = await loadFresh();

        const first = connectDB();
        const second = connectDB();
        resolveConnect!();
        await Promise.all([first, second]);

        expect(mongoose.connect).toHaveBeenCalledTimes(1);
    });

    it("waits for the connection before resolving", async () => {
        let resolveConnect: () => void;
        vi.mocked(mongoose.connect).mockReturnValue(
            new Promise((r) => {
                resolveConnect = () => r(mongoose as any);
            }) as any
        );
        const { connectDB } = await loadFresh();

        let done = false;
        const pending = connectDB().then(() => {
            done = true;
        });
        await Promise.resolve();
        expect(done).toBe(false);

        resolveConnect!();
        await pending;
        expect(done).toBe(true);
    });

    it("resolves rather than rejects when the connection fails, and retries next call", async () => {
        vi.mocked(mongoose.connect).mockRejectedValueOnce(
            new Error("connection refused")
        );
        const { connectDB } = await loadFresh();

        await expect(connectDB()).resolves.toBeUndefined();
        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledTimes(2);
    });

    it("swallows a synchronous connect failure instead of rejecting", async () => {
        vi.mocked(mongoose.connect).mockImplementation(() => {
            throw new Error("bad uri");
        });
        const { connectDB } = await loadFresh();

        await expect(connectDB()).resolves.toBeUndefined();
    });
});
