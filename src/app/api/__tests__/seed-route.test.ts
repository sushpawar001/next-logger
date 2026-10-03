import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * /api/seed/[userId] bulk-generates demo data. It is listed as a PUBLIC route
 * in src/proxy.ts, so its own token check is the only thing standing
 * between the internet and unlimited writes -- which makes the gap covered
 * below (docs/BUGS.md #1) worth pinning down precisely.
 */

vi.mock("@/models/glucoseModel", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("glucose") };
});
vi.mock("@/models/weightModel", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("weight") };
});
vi.mock("@/models/insulinModel", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("insulin") };
});
vi.mock("@/models/measurementsModel", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("measurements") };
});

import GlucoseModel from "@/models/glucoseModel";
import WeightModel from "@/models/weightModel";
import InsulinModel from "@/models/insulinModel";
import MeasurementsModel from "@/models/measurementsModel";
import { makeJsonRequest } from "@/test/http";
import { decryptDocumentFields } from "@/lib/mongooseEncryption";

// The modules are mocked, but their imported types are still the real
// mongoose models, which do not carry vitest's mock members.
const Glucose = GlucoseModel as any;
const Weight = WeightModel as any;
const Insulin = InsulinModel as any;
const Measurements = MeasurementsModel as any;

const MODELS = [Glucose, Weight, Insulin, Measurements] as any[];
const [glucoseMock, , insulinMock, measurementsMock] = MODELS;
const VALID_USER_ID = "65a000000000000000000001";
const TOKEN = "test-seed-token"; // matches vitest.config.ts TEST_ENV

/** The rows passed to a model's insertMany, decrypted back to plain values. */
const inserted = (model: any, fields: string[]) =>
    model.insertMany.mock.calls[0][0].map((row: Record<string, any>) =>
        decryptDocumentFields(row, fields, true)
    );

const seed = async (userId: string, body: Record<string, any>) => {
    const { POST } = await import("@/app/api/seed/[userId]/route");
    return POST(makeJsonRequest(`/api/seed/${userId}`, body), {
        params: Promise.resolve({ userId }),
    });
};

beforeEach(() => {
    for (const model of MODELS) {
        model.insertMany.mockReset();
        model.insertMany.mockResolvedValue([]);
    }
});

describe("token handling", () => {
    it("accepts the configured token", async () => {
        const res = await seed(VALID_USER_ID, { seed_token: TOKEN, count: 2 });

        expect(res.status).toBe(200);
        expect((await res.json()).success).toBe(true);
    });

    it("rejects a wrong token with 401", async () => {
        const res = await seed(VALID_USER_ID, { seed_token: "wrong", count: 2 });

        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({ error: "Invalid seed token" });
        for (const model of MODELS) expect(model.insertMany).not.toHaveBeenCalled();
    });

    // Regression for docs/BUGS.md #1: the guard used to run only when a token
    // was present, so omitting it skipped the check entirely.
    it.each([
        ["the field omitted", {}],
        ["an undefined token", { seed_token: undefined }],
        ["an empty-string token", { seed_token: "" }],
        ["a non-string token", { seed_token: 12345 }],
        ["a token with the right prefix", { seed_token: `${TOKEN}x` }],
    ])("rejects %s with 401 and writes nothing", async (_label, body) => {
        const res = await seed(VALID_USER_ID, { ...body, count: 1 });

        expect(res.status).toBe(401);
        for (const model of MODELS) expect(model.insertMany).not.toHaveBeenCalled();
    });

    it("rejects every request when SEED_TOKEN is not configured", async () => {
        vi.stubEnv("SEED_TOKEN", "");
        try {
            const res = await seed(VALID_USER_ID, { seed_token: "", count: 1 });

            expect(res.status).toBe(401);
            expect(Glucose.insertMany).not.toHaveBeenCalled();
        } finally {
            vi.unstubAllEnvs();
        }
    });
});

describe("input validation", () => {
    it.each([
        ["not an ObjectId", "not-an-id"],
        ["too short", "abc"],
    ])("rejects a userId that is %s", async (_label, userId) => {
        const res = await seed(userId, { seed_token: TOKEN });

        expect(res.status).toBe(400);
        await expect(res.json()).resolves.toEqual({ error: "Invalid user ID" });
    });

    it("returns 500 when the body is not valid JSON", async () => {
        const { POST } = await import("@/app/api/seed/[userId]/route");
        const req = new Request(`http://localhost:4000/api/seed/${VALID_USER_ID}`, {
            method: "POST",
            body: "not json",
            headers: { "content-type": "application/json" },
        });

        const res = await POST(req as any, { params: Promise.resolve({ userId: VALID_USER_ID }) });

        expect(res.status).toBe(500);
    });
});

describe("generated data", () => {
    it("writes the requested number of rows to all four collections", async () => {
        const res = await seed(VALID_USER_ID, { seed_token: TOKEN, count: 5 });

        for (const model of MODELS) {
            expect(model.insertMany).toHaveBeenCalledTimes(1);
            expect(model.insertMany.mock.calls[0][0]).toHaveLength(5);
        }
        expect((await res.json()).count).toEqual({
            measurements: 5,
            weight: 5,
            glucose: 5,
            insulin: 5,
        });
    });

    it("defaults to 180 rows over 60 days", async () => {
        await seed(VALID_USER_ID, { seed_token: TOKEN });

        expect(Glucose.insertMany.mock.calls[0][0]).toHaveLength(180);
    });

    it("stamps every row with the requested user", async () => {
        await seed(VALID_USER_ID, { seed_token: TOKEN, count: 3 });

        for (const model of MODELS) {
            for (const row of model.insertMany.mock.calls[0][0]) {
                expect(String(row.user)).toBe(VALID_USER_ID);
            }
        }
    });

    it("keeps generated dates inside the requested window", async () => {
        const days = 10;
        const earliest = new Date();
        earliest.setDate(earliest.getDate() - days - 1);

        await seed(VALID_USER_ID, { seed_token: TOKEN, count: 20, days });

        for (const row of Glucose.insertMany.mock.calls[0][0]) {
            expect(row.createdAt.getTime()).toBeGreaterThanOrEqual(
                earliest.getTime()
            );
        }
    });

    it("generates values inside each metric's documented range", async () => {
        await seed(VALID_USER_ID, { seed_token: TOKEN, count: 30 });

        for (const row of inserted(Glucose, ["value"])) {
            expect(row.value).toBeGreaterThanOrEqual(32);
            expect(row.value).toBeLessThanOrEqual(540);
        }
        for (const row of inserted(Insulin, ["units", "name"])) {
            expect(row.units).toBeGreaterThanOrEqual(2);
            expect(row.units).toBeLessThanOrEqual(20);
            expect(["Lantus", "Humalog", "NovoLog", "Levemir", "Tresiba"]).toContain(
                row.name
            );
        }
    });

    it("uses only real entry tags, or null", async () => {
        const { entryTags } = await import("@/constants/constants");

        await seed(VALID_USER_ID, { seed_token: TOKEN, count: 40 });

        for (const row of inserted(Glucose, ["tag"])) {
            expect([...entryTags, null]).toContain(row.tag);
        }
    });

    it("gives measurements all seven circumferences", async () => {
        await seed(VALID_USER_ID, { seed_token: TOKEN, count: 2 });

        for (const row of Measurements.insertMany.mock.calls[0][0]) {
            for (const field of [
                "arms",
                "chest",
                "abdomen",
                "waist",
                "hip",
                "thighs",
                "calves",
            ]) {
                expect(row).toHaveProperty(field);
            }
        }
    });

    /**
     * insertMany bypasses the schemas' pre('save') hooks, so the route encrypts
     * every field the models encrypt itself (docs/BUGS.md #2, fixed). Seeded
     * rows must be indistinguishable at rest from ones written through the API.
     */
    it.each([
        ["glucose", Glucose, ["value"]],
        ["weight", Weight, ["value"]],
        ["insulin", Insulin, ["units", "name"]],
        ["measurements", Measurements, ["arms", "chest", "abdomen", "waist", "hip", "thighs", "calves"]],
    ])("encrypts %s values at rest", async (_name, model, fields) => {
        await seed(VALID_USER_ID, { seed_token: TOKEN, count: 3 });

        for (const row of model.insertMany.mock.calls[0][0]) {
            for (const field of fields as string[]) {
                // Stored as a JSON string with iv/tag members, as storeAsString does
                expect(typeof row[field]).toBe("string");
                expect(JSON.parse(row[field])).toHaveProperty("iv");
            }
        }
    });

    it("encrypts a tag but leaves a null tag null", async () => {
        await seed(VALID_USER_ID, { seed_token: TOKEN, count: 40 });

        for (const row of Glucose.insertMany.mock.calls[0][0]) {
            if (row.tag !== null) {
                expect(JSON.parse(row.tag)).toHaveProperty("iv");
            }
        }
    });

    it("returns 500 when a bulk insert fails", async () => {
        Glucose.insertMany.mockRejectedValue(new Error("write conflict"));

        const res = await seed(VALID_USER_ID, { seed_token: TOKEN, count: 2 });

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({ error: "write conflict" });
    });
});
