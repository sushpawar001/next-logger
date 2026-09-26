import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The four metric resources share a near-identical handler set, so their
 * add / get / get-by-days / get-one / update / delete routes are exercised
 * from one table rather than twenty near-duplicate files.
 *
 * Cross-user scoping is proved separately in user-scoping.security.test.ts.
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
vi.mock("@/helpers/getUserObjectId", () => ({ getUserObjectId: vi.fn() }));

import GlucoseModel from "@/models/glucoseModel";
import WeightModel from "@/models/weightModel";
import InsulinModel from "@/models/insulinModel";
import MeasurementsModel from "@/models/measurementsModel";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import {
    asDoc,
    asDocs,
    createFailingQuery,
    createQuery,
} from "@/test/mongoose";
import { USER_A } from "@/test/auth";
import { makeJsonRequest, makeRequest } from "@/test/http";
import {
    ENTRY_ID,
    encryptedString,
    glucoseRow,
    insulinRow,
    measurementRow,
    weightRow,
} from "@/test/fixtures";

type Resource = {
    name: string;
    model: any;
    /** Fields converted from string to number on the way out. */
    numericFields: string[];
    row: (o?: Record<string, any>) => Record<string, any>;
    routes: {
        add: () => Promise<any>;
        getAll: () => Promise<any>;
        getDays: () => Promise<any>;
        getOne: () => Promise<any>;
        update: () => Promise<any>;
        del: () => Promise<any>;
    };
    /** Request body for the add route. */
    addBody: Record<string, any>;
    /** Payload the handler is expected to construct (minus `user`). */
    expectedPayload: Record<string, any>;
    addedMessage: string;
};

// The modules are mocked, but their imported types are still the real
// mongoose models, which do not carry vitest's mock members.
const Glucose = GlucoseModel as any;
const Weight = WeightModel as any;
const Insulin = InsulinModel as any;
const Measurements = MeasurementsModel as any;

const RESOURCES: Resource[] = [
    {
        name: "glucose",
        model: Glucose,
        numericFields: ["value"],
        row: glucoseRow,
        routes: {
            add: () => import("@/app/api/glucose/add/route"),
            getAll: () => import("@/app/api/glucose/get/route"),
            getDays: () => import("@/app/api/glucose/get/[days]/route"),
            getOne: () => import("@/app/api/glucose/get-one/[id]/route"),
            update: () => import("@/app/api/glucose/update/[id]/route"),
            del: () => import("@/app/api/glucose/delete/[id]/route"),
        },
        addBody: { value: 120, tag: "Fasting" },
        expectedPayload: { value: 120, tag: "Fasting" },
        addedMessage: "Glucose Entry added!",
    },
    {
        name: "weight",
        model: Weight,
        numericFields: ["value"],
        row: weightRow,
        routes: {
            add: () => import("@/app/api/weight/add/route"),
            getAll: () => import("@/app/api/weight/get/route"),
            getDays: () => import("@/app/api/weight/get/[days]/route"),
            getOne: () => import("@/app/api/weight/get-one/[id]/route"),
            update: () => import("@/app/api/weight/update/[id]/route"),
            del: () => import("@/app/api/weight/delete/[id]/route"),
        },
        addBody: { value: 72.4, tag: null },
        expectedPayload: { value: 72.4, tag: null },
        addedMessage: "Weight entry added!",
    },
    {
        name: "insulin",
        model: Insulin,
        numericFields: ["units"],
        row: insulinRow,
        routes: {
            add: () => import("@/app/api/insulin/add/route"),
            getAll: () => import("@/app/api/insulin/get/route"),
            getDays: () => import("@/app/api/insulin/get/[days]/route"),
            getOne: () => import("@/app/api/insulin/get-one/[id]/route"),
            update: () => import("@/app/api/insulin/update/[id]/route"),
            del: () => import("@/app/api/insulin/delete/[id]/route"),
        },
        addBody: { units: 12, name: "Lantus", tag: "Before meal" },
        expectedPayload: { units: 12, name: "Lantus", tag: "Before meal" },
        // The insulin route interpolates the insulin name into its message.
        addedMessage: "Lantus insulin Entry added!",
    },
];

const bySeconds = (iso: string) => new Date(iso);

describe.each(RESOURCES)("$name routes", (r) => {
    beforeEach(() => {
        vi.mocked(getUserObjectId).mockResolvedValue(USER_A);
        r.model.mockClear();
        r.model.instances.length = 0;
        r.model.save.mockReset();
        for (const op of [
            "find",
            "findOne",
            "findOneAndUpdate",
            "findOneAndDelete",
        ]) {
            r.model[op].mockReset();
            r.model[op].mockReturnValue(createQuery(op === "find" ? [] : null));
        }
    });

    describe("POST /add", () => {
        it("builds the payload from the body and stamps the caller", async () => {
            r.model.save.mockResolvedValueOnce(asDoc({ _id: ENTRY_ID, ...r.row() }));
            const { POST } = await r.routes.add();

            const res = await POST(makeJsonRequest("/add", r.addBody));

            expect(r.model).toHaveBeenCalledTimes(1);
            expect(r.model).toHaveBeenCalledWith(
                expect.objectContaining({ ...r.expectedPayload, user: USER_A })
            );
            expect(r.model.save).toHaveBeenCalledTimes(1);

            const body = await res.json();
            expect(res.status).toBe(200);
            expect(body.message).toBe(r.addedMessage);
            expect(body.entry).toBeDefined();
        });

        it("omits createdAt when no date is supplied, letting the schema default", async () => {
            r.model.save.mockResolvedValueOnce(asDoc({ _id: ENTRY_ID, ...r.row() }));
            const { POST } = await r.routes.add();

            await POST(makeJsonRequest("/add", r.addBody));

            expect(r.model.mock.calls[0][0]).not.toHaveProperty("createdAt");
        });

        it("passes a user-chosen date through as createdAt", async () => {
            r.model.save.mockResolvedValueOnce(asDoc({ _id: ENTRY_ID, ...r.row() }));
            const { POST } = await r.routes.add();

            await POST(
                makeJsonRequest("/add", {
                    ...r.addBody,
                    date: "2026-01-20T06:30:00.000Z",
                })
            );

            expect(r.model.mock.calls[0][0].createdAt).toBe(
                "2026-01-20T06:30:00.000Z"
            );
        });

        it("decrypts the saved entry before echoing it back", async () => {
            const encrypted: Record<string, any> = { _id: ENTRY_ID, user: USER_A };
            for (const field of r.numericFields) {
                encrypted[field] = encryptedString("42");
            }
            encrypted.tag = encryptedString("Fasting");
            r.model.save.mockResolvedValueOnce(asDoc(encrypted));
            const { POST } = await r.routes.add();

            const { entry } = await (
                await POST(makeJsonRequest("/add", r.addBody))
            ).json();

            for (const field of r.numericFields) {
                // decryptDocumentFields JSON.parses the plaintext, so "42" -> 42
                expect(entry[field]).toBe(42);
            }
            expect(entry.tag).toBe("Fasting");
        });

        it("returns 500 with the error message when the save fails", async () => {
            r.model.save.mockRejectedValueOnce(new Error("validation failed"));
            const { POST } = await r.routes.add();

            const res = await POST(makeJsonRequest("/add", r.addBody));

            expect(res.status).toBe(500);
            await expect(res.json()).resolves.toEqual({
                error: "validation failed",
            });
        });
    });

    describe("GET /get", () => {
        it("returns every row for the caller, newest first", async () => {
            const query = createQuery(asDocs([r.row({ _id: "a" }), r.row({ _id: "b" })]));
            r.model.find.mockReturnValue(query);
            const { GET } = await r.routes.getAll();

            const res = await GET();

            expect(r.model.find).toHaveBeenCalledWith(
                { user: USER_A },
                { __v: 0, user: 0 }
            );
            expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });

            const { data } = await res.json();
            expect(data).toHaveLength(2);
            for (const field of r.numericFields) {
                expect(typeof data[0][field]).toBe("number");
            }
        });

        it("returns an empty list when the user has no rows", async () => {
            r.model.find.mockReturnValue(createQuery([]));
            const { GET } = await r.routes.getAll();

            await expect((await GET()).json()).resolves.toEqual({ data: [] });
        });

        it("returns 500 when the query fails", async () => {
            r.model.find.mockReturnValue(
                createFailingQuery(new Error("connection lost"))
            );
            const { GET } = await r.routes.getAll();

            const res = await GET();

            expect(res.status).toBe(500);
            await expect(res.json()).resolves.toEqual({ error: "connection lost" });
        });
    });

    describe("GET /get/[days]", () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(bySeconds("2026-01-31T12:00:00.000Z"));
        });

        it("windows the query to the requested number of days", async () => {
            const query = createQuery(asDocs([r.row()]));
            r.model.find.mockReturnValue(query);
            const { GET } = await r.routes.getDays();

            const res = await GET(makeRequest("/get/7"), { params: { days: "7" } });

            const [filter, projection] = r.model.find.mock.calls[0];
            expect(filter.user).toBe(USER_A);
            expect(filter.createdAt.$gt.toISOString()).toBe(
                "2026-01-24T12:00:00.000Z"
            );
            expect(projection).toEqual({ __v: 0, user: 0 });
            expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(res.status).toBe(200);
        });

        // Next supplies params as strings; the handler relies on JS coercion.
        it.each([
            ["7", "2026-01-24T12:00:00.000Z"],
            ["30", "2026-01-01T12:00:00.000Z"],
            ["90", "2025-11-02T12:00:00.000Z"],
        ])("handles a %s-day window given as a string", async (days, expected) => {
            r.model.find.mockReturnValue(createQuery([]));
            const { GET } = await r.routes.getDays();

            await GET(makeRequest(`/get/${days}`), { params: { days } });

            expect(r.model.find.mock.calls[0][0].createdAt.$gt.toISOString()).toBe(
                expected
            );
        });

        it("converts encrypted string values back to numbers", async () => {
            r.model.find.mockReturnValue(createQuery(asDocs([r.row()])));
            const { GET } = await r.routes.getDays();

            const { data } = await (
                await GET(makeRequest("/get/7"), { params: { days: "7" } })
            ).json();

            for (const field of r.numericFields) {
                expect(typeof data[0][field]).toBe("number");
            }
        });

        it("returns 500 when the query fails", async () => {
            r.model.find.mockReturnValue(createFailingQuery(new Error("boom")));
            const { GET } = await r.routes.getDays();

            const res = await GET(makeRequest("/get/7"), { params: { days: "7" } });

            expect(res.status).toBe(500);
        });
    });

    describe("GET /get-one/[id]", () => {
        it("returns the row with numeric fields converted", async () => {
            r.model.findOne.mockReturnValue(createQuery(asDoc(r.row())));
            const { GET } = await r.routes.getOne();

            const res = await GET(makeRequest(`/get-one/${ENTRY_ID}`), {
                params: { id: ENTRY_ID },
            });

            expect(r.model.findOne).toHaveBeenCalledWith(
                { _id: ENTRY_ID, user: USER_A },
                { __v: 0, user: 0 }
            );

            const { data } = await res.json();
            for (const field of r.numericFields) {
                expect(typeof data[field]).toBe("number");
            }
        });

        /**
         * KNOWN BUG (docs/BUGS.md #12): a missing row means `data` is null and the
         * handler calls `.toObject()` on it, so a not-found becomes a 500
         * rather than a 404. Characterizing current behavior.
         */
        it("returns 500 rather than 404 when the row does not exist", async () => {
            r.model.findOne.mockReturnValue(createQuery(null));
            const { GET } = await r.routes.getOne();

            const res = await GET(makeRequest(`/get-one/${ENTRY_ID}`), {
                params: { id: ENTRY_ID },
            });

            expect(res.status).toBe(500);
            expect((await res.json()).error).toMatch(/toObject|null/i);
        });
    });

    describe("PUT /update/[id]", () => {
        it("scopes the update to the caller and returns the new document", async () => {
            r.model.findOneAndUpdate.mockReturnValue(createQuery(asDoc(r.row())));
            const { PUT } = await r.routes.update();

            const res = await PUT(
                makeJsonRequest(`/update/${ENTRY_ID}`, r.addBody, "PUT"),
                { params: { id: ENTRY_ID } }
            );

            const [filter, , options] = r.model.findOneAndUpdate.mock.calls[0];
            expect(filter).toEqual({ _id: ENTRY_ID, user: USER_A });
            expect(options).toEqual({ returnDocument: "after" });

            expect(res.status).toBe(200);
            expect((await res.json()).message).toBe("Data updated");
        });

        it("returns 500 when the update fails", async () => {
            r.model.findOneAndUpdate.mockReturnValue(
                createFailingQuery(new Error("cast failed"))
            );
            const { PUT } = await r.routes.update();

            const res = await PUT(
                makeJsonRequest(`/update/${ENTRY_ID}`, r.addBody, "PUT"),
                { params: { id: ENTRY_ID } }
            );

            expect(res.status).toBe(500);
            await expect(res.json()).resolves.toEqual({ error: "cast failed" });
        });
    });

    describe("DELETE /delete/[id]", () => {
        it("deletes the caller's row and echoes it back", async () => {
            r.model.findOneAndDelete.mockReturnValue(createQuery(asDoc(r.row())));
            const { DELETE } = await r.routes.del();

            const res = await DELETE(
                makeRequest(`/delete/${ENTRY_ID}`, { method: "DELETE" }),
                { params: { id: ENTRY_ID } }
            );

            expect(r.model.findOneAndDelete).toHaveBeenCalledWith({
                _id: ENTRY_ID,
                user: USER_A,
            });
            expect(res.status).toBe(200);
            expect((await res.json()).message).toBe("Data deleted");
        });

        /**
         * KNOWN BUG (docs/BUGS.md #13): deleting a row that does not exist still
         * reports success with `data: null` instead of a 404, so the client
         * cannot tell a real delete from a no-op.
         */
        it("reports success even when nothing matched", async () => {
            r.model.findOneAndDelete.mockReturnValue(createQuery(null));
            const { DELETE } = await r.routes.del();

            const res = await DELETE(
                makeRequest(`/delete/${ENTRY_ID}`, { method: "DELETE" }),
                { params: { id: ENTRY_ID } }
            );

            expect(res.status).toBe(200);
            expect((await res.json()).data).toBeNull();
        });

        it("returns 500 when the delete fails", async () => {
            r.model.findOneAndDelete.mockReturnValue(
                createFailingQuery(new Error("boom"))
            );
            const { DELETE } = await r.routes.del();

            const res = await DELETE(
                makeRequest(`/delete/${ENTRY_ID}`, { method: "DELETE" }),
                { params: { id: ENTRY_ID } }
            );

            expect(res.status).toBe(500);
        });
    });
});

/**
 * Measurements takes its seven circumferences nested under `body.measurements`,
 * unlike every other resource, so its add route gets its own coverage.
 */
describe("measurements routes", () => {
    const FIELDS = [
        "arms",
        "chest",
        "abdomen",
        "waist",
        "hip",
        "thighs",
        "calves",
    ];

    beforeEach(() => {
        vi.mocked(getUserObjectId).mockResolvedValue(USER_A);
        Measurements.mockClear();
        Measurements.instances.length = 0;
        Measurements.save.mockReset();
        for (const op of ["find", "findOne", "findOneAndUpdate", "findOneAndDelete"]) {
            (Measurements as any)[op].mockReset();
            (Measurements as any)[op].mockReturnValue(
                createQuery(op === "find" ? [] : null)
            );
        }
    });

    it("reads the seven circumferences from the nested measurements object", async () => {
        Measurements.save.mockResolvedValueOnce(asDoc(measurementRow()));
        const { POST } = await import("@/app/api/measurements/add/route");

        const res = await POST(
            makeJsonRequest("/add", {
                measurements: {
                    arms: 32,
                    chest: 98,
                    abdomen: 88,
                    waist: 84,
                    hip: 96,
                    thighs: 56,
                    calves: 38,
                    tag: "Other",
                },
            })
        );

        const payload = Measurements.mock.calls[0][0];
        for (const field of FIELDS) expect(payload).toHaveProperty(field);
        expect(payload.user).toBe(USER_A);
        expect(payload.tag).toBe("Other");
        expect((await res.json()).message).toBe("Measurements added!");
    });

    it("returns 500 when the body has no measurements object", async () => {
        const { POST } = await import("@/app/api/measurements/add/route");

        const res = await POST(makeJsonRequest("/add", {}));

        expect(res.status).toBe(500);
        expect(Measurements.save).not.toHaveBeenCalled();
    });

    it("converts all seven circumferences to numbers on read", async () => {
        Measurements.find.mockReturnValue(createQuery(asDocs([measurementRow()])));
        const { GET } = await import("@/app/api/measurements/get/route");

        // Unlike the other resources, this handler declares a request param.
        const { data } = await (await GET(makeRequest("/get"))).json();

        for (const field of FIELDS) expect(typeof data[0][field]).toBe("number");
    });

    it("windows the by-days query like the other resources", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(bySeconds("2026-01-31T12:00:00.000Z"));
        Measurements.find.mockReturnValue(createQuery([]));
        const { GET } = await import("@/app/api/measurements/get/[days]/route");

        await GET(makeRequest("/get/30"), { params: { days: "30" } });

        expect(
            Measurements.find.mock.calls[0][0].createdAt.$gt.toISOString()
        ).toBe("2026-01-01T12:00:00.000Z");
    });
});

/**
 * get-range powers the stats page: it fetches a double window in one query and
 * splits it into the current and previous period in JS, because `createdAt` is
 * the only queryable field on an encrypted collection.
 */
describe.each([
    {
        name: "glucose",
        model: Glucose,
        row: glucoseRow,
        load: () => import("@/app/api/glucose/get-range/[days]/route"),
    },
    {
        name: "weight",
        model: Weight,
        row: weightRow,
        load: () => import("@/app/api/weight/get-range/[days]/route"),
    },
])("$name get-range/[days]", (r) => {
    beforeEach(() => {
        vi.mocked(getUserObjectId).mockResolvedValue(USER_A);
        r.model.find.mockReset();
        vi.useFakeTimers();
        vi.setSystemTime(bySeconds("2026-01-31T12:00:00.000Z"));
    });

    it("splits a double window into current and previous periods", async () => {
        // 7-day window from a 2026-01-31 "now": current >= 01-24, previous 01-17..01-24
        const current = r.row({ _id: "cur", createdAt: new Date("2026-01-28T10:00:00Z") });
        const previous = r.row({ _id: "prev", createdAt: new Date("2026-01-20T10:00:00Z") });
        r.model.find.mockReturnValue(createQuery(asDocs([current, previous])));
        const { GET } = await r.load();

        const res = await GET(makeRequest("/get-range/7"), {
            params: { days: "7" },
        });

        const { data } = await res.json();
        expect(data.daysAgoData.map((d: any) => d._id)).toEqual(["cur"]);
        expect(data.prevDaysAgoData.map((d: any) => d._id)).toEqual(["prev"]);
    });

    it("queries a window twice the requested length, floored to midnight", async () => {
        r.model.find.mockReturnValue(createQuery([]));
        const { GET } = await r.load();

        await GET(makeRequest("/get-range/7"), { params: { days: "7" } });

        const cutoff = r.model.find.mock.calls[0][0].createdAt.$gt as Date;
        expect(cutoff.getHours()).toBe(0);
        expect(cutoff.getMinutes()).toBe(0);
        expect(cutoff.toISOString().slice(0, 10)).toBe("2026-01-17");
    });

    it("returns two empty periods when there is no data", async () => {
        r.model.find.mockReturnValue(createQuery([]));
        const { GET } = await r.load();

        const { data } = await (
            await GET(makeRequest("/get-range/7"), { params: { days: "7" } })
        ).json();

        expect(data).toEqual({ daysAgoData: [], prevDaysAgoData: [] });
    });

    it("returns 500 when the query fails", async () => {
        r.model.find.mockReturnValue(createFailingQuery(new Error("boom")));
        const { GET } = await r.load();

        const res = await GET(makeRequest("/get-range/7"), {
            params: { days: "7" },
        });

        expect(res.status).toBe(500);
    });
});
