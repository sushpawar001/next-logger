import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The Clerk webhook mirrors users into Mongo and cascades deletes. It is a
 * PUBLIC route in src/proxy.ts, and it performs no signature verification
 * (docs/BUGS.md #3), so anyone who can reach it can drive these branches.
 */

vi.mock("@/models/userModelClerk", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("users") };
});
vi.mock("@/models/glucoseModel", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("glucose") };
});
vi.mock("@/models/insulinModel", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("insulin") };
});
vi.mock("@/models/insulinTypeModel", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("insulintype") };
});
vi.mock("@/models/measurementsModel", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("measurements") };
});
vi.mock("@/models/weightModel", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("weight") };
});

import ClerkUserModel from "@/models/userModelClerk";
import GlucoseModel from "@/models/glucoseModel";
import InsulinModel from "@/models/insulinModel";
import InsulinTypeModel from "@/models/insulinTypeModel";
import MeasurementsModel from "@/models/measurementsModel";
import WeightModel from "@/models/weightModel";
import { clerkClient } from "@clerk/nextjs/server";
import { createQuery } from "@/test/mongoose";
import { CLERK_ID_A, USER_A } from "@/test/auth";
import { makeJsonRequest } from "@/test/http";

// The modules are mocked, but their imported types are still the real
// mongoose models, which do not carry vitest's mock members.
const Glucose = GlucoseModel as any;
const Weight = WeightModel as any;
const Insulin = InsulinModel as any;
const Measurements = MeasurementsModel as any;
// clerkClient() resolves to the one shared client mocked in setup.node.ts.
let clerk: Awaited<ReturnType<typeof clerkClient>>;
beforeAll(async () => {
    clerk = await clerkClient();
});
const ClerkUser = ClerkUserModel as any;
const InsulinType = InsulinTypeModel as any;

const clerkUser = ClerkUser as any;
const CASCADE_MODELS = [Glucose, Insulin, InsulinType, Measurements, Weight] as any[];

const post = async (body: Record<string, any>) => {
    const { POST } = await import("@/app/api/webhooks/user/route");
    return POST(makeJsonRequest("/api/webhooks/user", body));
};

const createdEvent = (id = CLERK_ID_A, email = "ada@example.com") => ({
    type: "user.created",
    data: { id, email_addresses: [{ email_address: email }] },
});

const deletedEvent = (id = CLERK_ID_A) => ({
    type: "user.deleted",
    data: { id },
});

beforeEach(() => {
    clerkUser.create.mockReset();
    clerkUser.findOne.mockReset();
    clerkUser.findOneAndDelete.mockReset();
    clerkUser.create.mockResolvedValue({ _id: USER_A });
    clerkUser.findOne.mockReturnValue(createQuery({ _id: USER_A }));
    clerkUser.findOneAndDelete.mockReturnValue(createQuery({ _id: USER_A }));

    for (const model of CASCADE_MODELS) {
        model.deleteMany.mockReset();
        model.deleteMany.mockReturnValue(createQuery({ deletedCount: 1 }));
    }
    vi.mocked(clerk.users.updateUserMetadata).mockClear();
});

describe("user.created", () => {
    it("mirrors the Clerk user into Mongo with a 30-day trial", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

        const res = await post(createdEvent());

        expect(clerkUser.create).toHaveBeenCalledTimes(1);
        const payload = clerkUser.create.mock.calls[0][0];
        expect(payload).toMatchObject({
            email: "ada@example.com",
            clerkUserId: CLERK_ID_A,
            layoutSettings: "diabetes",
            subscriptionPlan: "trial",
        });
        expect(payload.subscriptionEndDate.toISOString()).toBe(
            "2026-01-31T00:00:00.000Z"
        );

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            message: "User created successfully",
        });
    });

    it("mirrors the trial into Clerk publicMetadata", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

        await post(createdEvent());

        expect(clerk.users.updateUserMetadata).toHaveBeenCalledWith(
            CLERK_ID_A,
            {
                publicMetadata: {
                    subscriptionPlan: "trial",
                    subscriptionEndDate: "2026-01-31T00:00:00.000Z",
                },
            }
        );
    });

    it("takes the first email address on the event", async () => {
        await post({
            type: "user.created",
            data: {
                id: CLERK_ID_A,
                email_addresses: [
                    { email_address: "first@example.com" },
                    { email_address: "second@example.com" },
                ],
            },
        });

        expect(clerkUser.create.mock.calls[0][0].email).toBe("first@example.com");
    });

    it("returns 500 when the event carries no email address", async () => {
        const res = await post({
            type: "user.created",
            data: { id: CLERK_ID_A, email_addresses: [] },
        });

        expect(res.status).toBe(500);
        expect(clerkUser.create).not.toHaveBeenCalled();
    });

    it("returns 500 when the insert fails", async () => {
        clerkUser.create.mockRejectedValue(new Error("duplicate key"));

        const res = await post(createdEvent());

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Internal Server Error",
        });
    });

    /**
     * KNOWN BUG (docs/BUGS.md #3): the `user.created` case has no `break`, so when
     * `create` resolves falsy the switch FALLS THROUGH into `user.deleted` and
     * starts a cascade delete using the created event's payload.
     * Characterizing current behavior.
     */
    it("falls through into the delete branch when create returns falsy", async () => {
        clerkUser.create.mockResolvedValue(null);

        await post(createdEvent());

        expect(clerkUser.findOne).toHaveBeenCalledWith({
            clerkUserId: CLERK_ID_A,
        });
        expect(Glucose.deleteMany).toHaveBeenCalled();
    });
});

describe("user.deleted", () => {
    it("cascades the delete across all five collections then the user", async () => {
        const res = await post(deletedEvent());

        for (const model of CASCADE_MODELS) {
            expect(model.deleteMany).toHaveBeenCalledWith({ user: USER_A });
        }
        expect(clerkUser.findOneAndDelete).toHaveBeenCalledWith({
            clerkUserId: CLERK_ID_A,
        });

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            message: "User deleted successfully",
        });
    });

    it("returns 500 when the user does not exist", async () => {
        // The handler logs existingUser._id before the null check, so a missing
        // user throws rather than reaching the intended 404. See docs/BUGS.md #16.
        clerkUser.findOne.mockReturnValue(createQuery(null));

        const res = await post(deletedEvent());

        expect(res.status).toBe(500);
        for (const model of CASCADE_MODELS) {
            expect(model.deleteMany).not.toHaveBeenCalled();
        }
    });

    it("returns 500 when a cascade delete fails", async () => {
        Glucose.deleteMany.mockReturnValue(
            createQuery(() => Promise.reject(new Error("write conflict")))
        );

        expect((await post(deletedEvent())).status).toBe(500);
    });
});

describe("other events", () => {
    it.each(["user.updated", "session.created", "organization.created"])(
        "acknowledges %s without touching the database",
        async (type) => {
            const res = await post({ type, data: { id: CLERK_ID_A } });

            expect(res.status).toBe(200);
            await expect(res.json()).resolves.toEqual({
                message: "Webhook received",
            });
            expect(clerkUser.create).not.toHaveBeenCalled();
            expect(clerkUser.findOneAndDelete).not.toHaveBeenCalled();
        }
    );

    it("acknowledges an event with no type", async () => {
        expect((await post({ data: {} })).status).toBe(200);
    });

    /**
     * KNOWN BUG (docs/BUGS.md #3): there is no svix signature verification, so an
     * unsigned request from anyone is processed as a genuine Clerk event on a
     * route that middleware marks public. Characterizing current behavior.
     */
    it("processes an unsigned request", async () => {
        const res = await post(deletedEvent());

        expect(res.status).toBe(200);
        expect(clerkUser.findOneAndDelete).toHaveBeenCalled();
    });
});
