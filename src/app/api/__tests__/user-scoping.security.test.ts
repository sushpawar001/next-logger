import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The single most important guarantee in this API: a signed-in user must never
 * be able to read, update or delete another user's health records.
 *
 * Every single-row handler is supposed to match on `{ _id, user }` TOGETHER. A
 * handler that regressed to matching on `_id` alone would still pass its own
 * happy-path test but would leak data across accounts. This suite proves the
 * pairing for all four metric resources at once, and the source-level sweep at
 * the bottom fails if a new route is added without a matching case here.
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
import { asDoc, createQuery } from "@/test/mongoose";
import { USER_A, USER_B } from "@/test/auth";
import { makeJsonRequest, makeRequest } from "@/test/http";
import {
    ENTRY_ID,
    glucoseRow,
    insulinRow,
    measurementRow,
    ownedBy,
    weightRow,
} from "@/test/fixtures";

type Op = "findOne" | "findOneAndUpdate" | "findOneAndDelete";

type Case = {
    name: string;
    /** Static importer -- Vite cannot analyse `import(variable)`. */
    load: () => Promise<Record<string, any>>;
    method: "GET" | "PUT" | "DELETE";
    model: any;
    op: Op;
    owned: Record<string, any>;
    body?: Record<string, any>;
    /** How the handler behaves when the scoped query matches nothing. */
    onMiss: "null-200" | "throws-500";
};

// The modules are mocked, but their imported types are still the real
// mongoose models, which do not carry vitest's mock members.
const Glucose = GlucoseModel as any;
const Weight = WeightModel as any;
const Insulin = InsulinModel as any;
const Measurements = MeasurementsModel as any;

const CASES: Case[] = [
    // ---- DELETE ---------------------------------------------------------
    { name: "DELETE /api/glucose/delete/[id]", load: () => import("@/app/api/glucose/delete/[id]/route"), method: "DELETE", model: Glucose, op: "findOneAndDelete", owned: ownedBy(glucoseRow()), onMiss: "null-200" },
    { name: "DELETE /api/weight/delete/[id]", load: () => import("@/app/api/weight/delete/[id]/route"), method: "DELETE", model: Weight, op: "findOneAndDelete", owned: ownedBy(weightRow()), onMiss: "null-200" },
    { name: "DELETE /api/insulin/delete/[id]", load: () => import("@/app/api/insulin/delete/[id]/route"), method: "DELETE", model: Insulin, op: "findOneAndDelete", owned: ownedBy(insulinRow()), onMiss: "null-200" },
    { name: "DELETE /api/measurements/delete/[id]", load: () => import("@/app/api/measurements/delete/[id]/route"), method: "DELETE", model: Measurements, op: "findOneAndDelete", owned: ownedBy(measurementRow()), onMiss: "null-200" },

    // ---- UPDATE ---------------------------------------------------------
    { name: "PUT /api/glucose/update/[id]", load: () => import("@/app/api/glucose/update/[id]/route"), method: "PUT", model: Glucose, op: "findOneAndUpdate", owned: ownedBy(glucoseRow()), body: { value: 130, tag: "Fasting" }, onMiss: "null-200" },
    { name: "PUT /api/weight/update/[id]", load: () => import("@/app/api/weight/update/[id]/route"), method: "PUT", model: Weight, op: "findOneAndUpdate", owned: ownedBy(weightRow()), body: { value: 71.2, createdAt: "2026-01-30T07:00:00.000Z" }, onMiss: "null-200" },
    { name: "PUT /api/insulin/update/[id]", load: () => import("@/app/api/insulin/update/[id]/route"), method: "PUT", model: Insulin, op: "findOneAndUpdate", owned: ownedBy(insulinRow()), body: { units: 14, name: "Lantus", createdAt: "2026-01-30T21:00:00.000Z" }, onMiss: "null-200" },
    { name: "PUT /api/measurements/update/[id]", load: () => import("@/app/api/measurements/update/[id]/route"), method: "PUT", model: Measurements, op: "findOneAndUpdate", owned: ownedBy(measurementRow()), body: { arms: 33, createdAt: "2026-01-30T06:00:00.000Z" }, onMiss: "null-200" },

    // ---- GET ONE --------------------------------------------------------
    { name: "GET /api/glucose/get-one/[id]", load: () => import("@/app/api/glucose/get-one/[id]/route"), method: "GET", model: Glucose, op: "findOne", owned: glucoseRow(), onMiss: "throws-500" },
    { name: "GET /api/weight/get-one/[id]", load: () => import("@/app/api/weight/get-one/[id]/route"), method: "GET", model: Weight, op: "findOne", owned: weightRow(), onMiss: "throws-500" },
    { name: "GET /api/insulin/get-one/[id]", load: () => import("@/app/api/insulin/get-one/[id]/route"), method: "GET", model: Insulin, op: "findOne", owned: insulinRow(), onMiss: "throws-500" },
    { name: "GET /api/measurements/get-one/[id]", load: () => import("@/app/api/measurements/get-one/[id]/route"), method: "GET", model: Measurements, op: "findOne", owned: measurementRow(), onMiss: "throws-500" },
];

/**
 * Emulates Mongo: the row only comes back when the filter's `user` matches its
 * owner. If a handler ever drops `user`, the isolation test below still gets
 * the row for user B and fails -- which is the point.
 */
const scopedResponder = (c: Case, owner: string) => (filter: Record<string, any>) =>
    createQuery(
        filter?.user === owner && filter?._id === ENTRY_ID ? asDoc(c.owned) : null
    );

const invoke = (mod: Record<string, any>, c: Case) =>
    mod[c.method](
        c.body
            ? makeJsonRequest(`/api/x/${ENTRY_ID}`, c.body, c.method as any)
            : makeRequest(`/api/x/${ENTRY_ID}`, { method: c.method }),
        { params: { id: ENTRY_ID } }
    );

/** A value from the owner's row that must never appear in another user's response. */
const secretOf = (c: Case) =>
    String(c.owned.value ?? c.owned.units ?? c.owned.arms);

describe("every single-row handler is scoped to the caller", () => {
    beforeEach(() => {
        for (const model of [Glucose, Weight, Insulin, Measurements]) {
            for (const op of ["findOne", "findOneAndUpdate", "findOneAndDelete"] as Op[]) {
                (model as any)[op].mockReset();
            }
        }
    });

    describe.each(CASES)("$name", (c) => {
        it("filters on both _id and user, and on nothing else", async () => {
            vi.mocked(getUserObjectId).mockResolvedValue(USER_A);
            c.model[c.op].mockImplementation(scopedResponder(c, USER_A));

            const res = await invoke(await c.load(), c);

            expect(c.model[c.op]).toHaveBeenCalledTimes(1);
            const filter = c.model[c.op].mock.calls[0][0];

            expect(filter).toMatchObject({ _id: ENTRY_ID, user: USER_A });
            // Guards against an unscoped `{ _id }` lookup slipping in.
            expect(Object.keys(filter).sort()).toEqual(["_id", "user"]);
            expect(res.status).toBe(200);
        });

        it("cannot reach a row owned by someone else", async () => {
            vi.mocked(getUserObjectId).mockResolvedValue(USER_B);
            c.model[c.op].mockImplementation(scopedResponder(c, USER_A));

            const res = await invoke(await c.load(), c);

            expect(c.model[c.op].mock.calls[0][0].user).toBe(USER_B);

            const body = await res.json();
            if (c.onMiss === "null-200") {
                expect(res.status).toBe(200);
                expect(body.data).toBeNull();
            } else {
                // get-one calls .toObject() on null, so a miss surfaces as 500.
                expect(res.status).toBe(500);
            }
            expect(JSON.stringify(body)).not.toContain(secretOf(c));
        });

        it("never touches the model when the caller is unauthenticated", async () => {
            vi.mocked(getUserObjectId).mockRejectedValue(
                new Error("User not logged in")
            );

            const res = await invoke(await c.load(), c);

            expect(c.model[c.op]).not.toHaveBeenCalled();
            // Characterization: the shared try/catch turns this into a 500
            // rather than a 401. See docs/BUGS.md #14.
            expect(res.status).toBe(500);
            await expect(res.json()).resolves.toEqual({
                error: "User not logged in",
            });
        });
    });
});

describe("the case table covers every single-row route on disk", () => {
    const apiRoot = path.resolve("src/app/api");

    /** Every route.ts under a delete/update/get-one segment. */
    const routeFiles: string[] = [];
    const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (/^route\.(ts|js)$/.test(entry.name)) routeFiles.push(full);
        }
    };
    walk(apiRoot);

    const singleRow = routeFiles.filter((f) => {
        const rel = path.relative(apiRoot, f).split(path.sep).join("/");
        return /(^|\/)(delete|update|get-one)\//.test(rel);
    });

    it("finds the expected number of single-row routes", () => {
        expect(singleRow.length).toBe(CASES.length);
    });

    it.each(singleRow.map((f) => [path.relative(apiRoot, f).split(path.sep).join("/"), f]))(
        "%s is represented in the case table",
        (rel) => {
            const resource = rel.split("/")[0];
            const action = rel.split("/")[1];
            const covered = CASES.some(
                (c) => c.name.includes(`/${resource}/`) && c.name.includes(action)
            );

            expect(covered).toBe(true);
        }
    );

    it.each(singleRow.map((f) => [path.relative(apiRoot, f).split(path.sep).join("/"), f]))(
        "%s queries on _id and user together in its source",
        (_rel, full) => {
            const source = fs.readFileSync(full as string, "utf8");

            // Catches the pattern even in a route not yet in the table above.
            expect(source).toMatch(
                /\{\s*_id:\s*params\.id,\s*user:\s*user\s*\}/
            );
        }
    );
});
