import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/models/userModelClerk", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("users") };
});
vi.mock("@/models/userModel", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("usersLegacy") };
});
vi.mock("@/models/insulinTypeModel", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    const model: any = createModelMock("insulintype");
    // users/get-insulin re-registers this schema on mongoose at import time.
    model.schema = {};
    return { default: model };
});
vi.mock("@/models/contactUs", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("contactus") };
});
vi.mock("@/helpers/getUserObjectId", () => ({ getUserObjectId: vi.fn() }));
vi.mock("mongoose", () => ({
    default: { model: vi.fn(), models: {}, Schema: class {} },
}));

import ClerkUser from "@/models/userModelClerk";
import LegacyUser from "@/models/userModel";
import InsulinType from "@/models/insulinTypeModel";
import ContactUs from "@/models/contactUs";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { auth } from "@clerk/nextjs/server";
import { asDoc, createFailingQuery, createQuery } from "@/test/mongoose";
import { CLERK_ID_A, USER_A, mockClerkSignedIn, mockClerkSignedOut } from "@/test/auth";
import { makeJsonRequest, makeRequest } from "@/test/http";

const clerkUser = ClerkUser as any;
const legacyUser = LegacyUser as any;
const insulinType = InsulinType as any;
const contactUs = ContactUs as any;

beforeEach(() => {
    vi.mocked(getUserObjectId).mockResolvedValue(USER_A);
    for (const model of [clerkUser, legacyUser, insulinType, contactUs]) {
        model.mockClear();
        model.instances.length = 0;
        model.save.mockReset();
        for (const op of [
            "find",
            "findOne",
            "findById",
            "findByIdAndUpdate",
            "create",
        ]) {
            model[op].mockReset();
            model[op].mockReturnValue(createQuery(op === "find" ? [] : null));
        }
        model.create.mockReset();
    }
});

describe("GET /api/users/get-layout", () => {
    it("returns the stored layout preference", async () => {
        clerkUser.findById.mockReturnValue(
            createQuery({ layoutSettings: "fitness" })
        );
        const { GET } = await import("@/app/api/users/get-layout/route");

        const res = await GET(makeRequest("/api/users/get-layout"));

        expect(clerkUser.findById).toHaveBeenCalledWith(USER_A);
        await expect(res.json()).resolves.toMatchObject({ data: "fitness" });
    });

    it("falls back to an empty string when no preference is set", async () => {
        clerkUser.findById.mockReturnValue(createQuery({ layoutSettings: null }));
        const { GET } = await import("@/app/api/users/get-layout/route");

        const res = await GET(makeRequest("/api/users/get-layout"));

        expect((await res.json()).data).toBe("");
    });

    it("returns 500 when the user row is missing", async () => {
        clerkUser.findById.mockReturnValue(createQuery(null));
        const { GET } = await import("@/app/api/users/get-layout/route");

        expect((await GET(makeRequest("/x"))).status).toBe(500);
    });
});

describe("POST /api/users/set-layout", () => {
    it.each(["diabetes", "fitness"])("stores the %s layout", async (layout) => {
        clerkUser.findByIdAndUpdate.mockReturnValue(
            createQuery({ layoutSettings: layout })
        );
        const { POST } = await import("@/app/api/users/set-layout/route");

        const res = await POST(
            makeJsonRequest("/api/users/set-layout", { layoutSettings: layout })
        );

        expect(clerkUser.findByIdAndUpdate).toHaveBeenCalledWith(
            USER_A,
            { $set: { layoutSettings: layout } },
            { new: true }
        );
        expect((await res.json()).message).toBe("Layout settings updated!");
    });

    it("returns 500 when the update fails", async () => {
        clerkUser.findByIdAndUpdate.mockReturnValue(
            createFailingQuery(new Error("validation failed"))
        );
        const { POST } = await import("@/app/api/users/set-layout/route");

        const res = await POST(
            makeJsonRequest("/api/users/set-layout", { layoutSettings: "nope" })
        );

        expect(res.status).toBe(500);
    });
});

describe("GET /api/users/subscription", () => {
    /** This route is the only one that calls Clerk's auth() directly. */
    it("returns 401 when there is no Clerk session", async () => {
        mockClerkSignedOut();
        const { GET } = await import("@/app/api/users/subscription/route");

        const res = await GET();

        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
    });

    it("returns 404 when the Clerk user has no mirrored row", async () => {
        mockClerkSignedIn();
        clerkUser.findOne.mockReturnValue(createQuery(null));
        const { GET } = await import("@/app/api/users/subscription/route");

        const res = await GET();

        expect(res.status).toBe(404);
        await expect(res.json()).resolves.toEqual({ error: "User not found" });
    });

    it("reports the plan and days remaining", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
        mockClerkSignedIn();
        clerkUser.findOne.mockReturnValue(
            createQuery({
                subscriptionPlan: "trial",
                subscriptionEndDate: new Date("2026-01-31T00:00:00.000Z"),
            })
        );
        const { GET } = await import("@/app/api/users/subscription/route");

        const body = await (await GET()).json();

        expect(clerkUser.findOne).toHaveBeenCalledWith({
            clerkUserId: CLERK_ID_A,
        });
        expect(body.subscriptionPlan).toBe("trial");
        expect(body.remainingDays).toBe(30);
    });

    it("reports a negative day count for an expired subscription", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-02-10T00:00:00.000Z"));
        mockClerkSignedIn();
        clerkUser.findOne.mockReturnValue(
            createQuery({
                subscriptionPlan: "trial",
                subscriptionEndDate: new Date("2026-01-31T00:00:00.000Z"),
            })
        );
        const { GET } = await import("@/app/api/users/subscription/route");

        expect((await (await GET()).json()).remainingDays).toBeLessThan(0);
    });

    it('defaults the plan to "free" when the field is absent', async () => {
        mockClerkSignedIn();
        clerkUser.findOne.mockReturnValue(
            createQuery({ subscriptionEndDate: new Date("2026-06-01T00:00:00.000Z") })
        );
        const { GET } = await import("@/app/api/users/subscription/route");

        expect((await (await GET()).json()).subscriptionPlan).toBe("free");
    });

    it("returns a generic 500 when the lookup throws", async () => {
        mockClerkSignedIn();
        clerkUser.findOne.mockReturnValue(createFailingQuery(new Error("boom")));
        const { GET } = await import("@/app/api/users/subscription/route");

        const res = await GET();

        expect(res.status).toBe(500);
        // This route deliberately hides the internal message.
        await expect(res.json()).resolves.toEqual({
            error: "Internal server error",
        });
    });
});

describe("POST /api/users/add-insulin", () => {
    it("rejects an insulin type that does not exist", async () => {
        insulinType.findOne.mockReturnValue(createQuery(null));
        const { POST } = await import("@/app/api/users/add-insulin/route");

        const res = await POST(makeJsonRequest("/x", { name: "Nope" }));

        expect(res.status).toBe(400);
        await expect(res.json()).resolves.toEqual({
            error: "Insulin does not exists!",
        });
        expect(legacyUser.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("adds a known insulin to the user without duplicating it", async () => {
        const insulin = { _id: "i1", name: "Lantus" };
        insulinType.findOne.mockReturnValue(createQuery(insulin));
        legacyUser.findByIdAndUpdate.mockReturnValue(
            createQuery({ _id: USER_A, insulins: [insulin] })
        );
        const { POST } = await import("@/app/api/users/add-insulin/route");

        const res = await POST(makeJsonRequest("/x", { name: "Lantus" }));

        expect(legacyUser.findByIdAndUpdate).toHaveBeenCalledWith(
            USER_A,
            { $addToSet: { insulins: insulin } },
            { new: true }
        );
        expect((await res.json()).message).toBe("User updated successfully");
    });

    it("returns 500 when the update fails", async () => {
        insulinType.findOne.mockReturnValue(createQuery({ _id: "i1" }));
        legacyUser.findByIdAndUpdate.mockReturnValue(
            createFailingQuery(new Error("boom"))
        );
        const { POST } = await import("@/app/api/users/add-insulin/route");

        expect(
            (await POST(makeJsonRequest("/x", { name: "Lantus" }))).status
        ).toBe(500);
    });
});

describe("POST /api/users/bulk-add-insulin", () => {
    it("replaces the whole insulin list", async () => {
        const insulinData = ["i1", "i2"];
        legacyUser.findByIdAndUpdate.mockReturnValue(
            createQuery({ _id: USER_A, insulins: insulinData })
        );
        const { POST } = await import("@/app/api/users/bulk-add-insulin/route");

        const res = await POST(makeJsonRequest("/x", { insulinData }));

        expect(legacyUser.findByIdAndUpdate).toHaveBeenCalledWith(
            USER_A,
            { $set: { insulins: insulinData } },
            { new: true }
        );
        expect((await res.json()).insulin).toEqual(insulinData);
    });

    it("accepts an empty list, clearing the user's insulins", async () => {
        legacyUser.findByIdAndUpdate.mockReturnValue(
            createQuery({ _id: USER_A, insulins: [] })
        );
        const { POST } = await import("@/app/api/users/bulk-add-insulin/route");

        const res = await POST(makeJsonRequest("/x", { insulinData: [] }));

        expect(
            legacyUser.findByIdAndUpdate.mock.calls[0][1].$set.insulins
        ).toEqual([]);
        expect(res.status).toBe(200);
    });

    it("returns 500 when the update fails", async () => {
        legacyUser.findByIdAndUpdate.mockReturnValue(
            createFailingQuery(new Error("boom"))
        );
        const { POST } = await import("@/app/api/users/bulk-add-insulin/route");

        expect(
            (await POST(makeJsonRequest("/x", { insulinData: [] }))).status
        ).toBe(500);
    });
});

describe("GET /api/users/get-insulin", () => {
    it("returns the user's populated insulin list", async () => {
        const query = createQuery({ insulins: [{ _id: "i1", name: "Lantus" }] });
        legacyUser.findById.mockReturnValue(query);
        const { GET } = await import("@/app/api/users/get-insulin/route");

        const res = await GET(makeRequest("/x"));

        expect(legacyUser.findById).toHaveBeenCalledWith(USER_A);
        expect(query.populate).toHaveBeenCalledWith("insulins");
        expect((await res.json()).data).toEqual([{ _id: "i1", name: "Lantus" }]);
    });

    it("returns an empty list alongside a 500 when the lookup fails", async () => {
        legacyUser.findById.mockReturnValue(createFailingQuery(new Error("boom")));
        const { GET } = await import("@/app/api/users/get-insulin/route");

        const res = await GET(makeRequest("/x"));

        expect(res.status).toBe(500);
        expect((await res.json()).data).toEqual([]);
    });
});

describe("insulin-type routes", () => {
    it("lists every insulin type", async () => {
        insulinType.find.mockReturnValue(
            createQuery([{ name: "Lantus" }, { name: "NovoRapid" }])
        );
        const { GET } = await import("@/app/api/insulin-type/get/route");

        const res = await GET(makeRequest("/x"));

        expect(insulinType.find).toHaveBeenCalledWith({});
        expect((await res.json()).data).toHaveLength(2);
    });

    it("returns 500 when the list query fails", async () => {
        insulinType.find.mockReturnValue(createFailingQuery(new Error("boom")));
        const { GET } = await import("@/app/api/insulin-type/get/route");

        expect((await GET(makeRequest("/x"))).status).toBe(500);
    });

    it("trims the name before storing a new type", async () => {
        insulinType.findOne.mockReturnValue(createQuery(null));
        insulinType.create.mockResolvedValue({ _id: "i1", name: "Lantus" });
        const { POST } = await import("@/app/api/insulin-type/add/route");

        const res = await POST(makeJsonRequest("/x", { name: "  Lantus  " }));

        expect(insulinType.create).toHaveBeenCalledWith({ name: "Lantus" });
        expect((await res.json()).message).toBe("Lantus insulin added!");
    });

    it("rejects a duplicate name with 400", async () => {
        insulinType.findOne.mockReturnValue(createQuery({ name: "Lantus" }));
        const { POST } = await import("@/app/api/insulin-type/add/route");

        const res = await POST(makeJsonRequest("/x", { name: "Lantus" }));

        expect(res.status).toBe(400);
        await expect(res.json()).resolves.toEqual({
            error: "Lantus Insulin already exists",
        });
        expect(insulinType.create).not.toHaveBeenCalled();
    });

    it("returns 500 when the name is missing", async () => {
        const { POST } = await import("@/app/api/insulin-type/add/route");

        expect((await POST(makeJsonRequest("/x", {}))).status).toBe(500);
    });

    /**
     * KNOWN BUG (docs/BUGS.md #5): the getUserObjectId import is commented out, so
     * this route writes to a globally shared collection with no authentication
     * at all. Characterizing current behavior.
     */
    it("writes without ever resolving a user", async () => {
        insulinType.findOne.mockReturnValue(createQuery(null));
        insulinType.create.mockResolvedValue({ _id: "i1", name: "Tresiba" });
        const { POST } = await import("@/app/api/insulin-type/add/route");

        await POST(makeJsonRequest("/x", { name: "Tresiba" }));

        expect(getUserObjectId).not.toHaveBeenCalled();
    });
});

describe("POST /api/contact-us/add", () => {
    it("stores the message and returns 201", async () => {
        contactUs.save.mockResolvedValueOnce(asDoc({ _id: "c1" }));
        const { POST } = await import("@/app/api/contact-us/add/route");

        const res = await POST(
            makeJsonRequest("/x", {
                name: "Ada",
                email: "ada@example.com",
                message: "Hello",
            })
        );

        expect(contactUs).toHaveBeenCalledWith({
            name: "Ada",
            email: "ada@example.com",
            message: "Hello",
        });
        expect(res.status).toBe(201);
        await expect(res.json()).resolves.toEqual({
            message: "Message sent successfully",
        });
    });

    it("returns a generic 500 when the save fails", async () => {
        contactUs.save.mockRejectedValueOnce(new Error("validation failed"));
        const { POST } = await import("@/app/api/contact-us/add/route");

        const res = await POST(
            makeJsonRequest("/x", { name: "", email: "", message: "" })
        );

        expect(res.status).toBe(500);
        // The message is deliberately generic, not the mongoose error.
        await expect(res.json()).resolves.toEqual({
            message: "Error sending message",
        });
    });
});
