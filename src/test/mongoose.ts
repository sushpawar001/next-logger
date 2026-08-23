import { vi, type Mock } from "vitest";

/**
 * Test doubles for mongoose models.
 *
 * Every API route imports a compiled model and chains query methods on it. We
 * mock at the module boundary (`vi.mock("@/models/glucoseModel")`) so the real
 * model file never executes -- that avoids building a real schema, running
 * `addEncryptionHooks`, touching the mongoose model registry, and the 10s
 * query-buffering timeout that a real (unconnected) model would impose.
 */

/** Query methods that return the query itself, so handlers can chain freely. */
const CHAINABLE = [
    "sort",
    "select",
    "lean",
    "populate",
    "limit",
    "skip",
    "where",
    "equals",
    "setOptions",
    "session",
    "collation",
    "maxTimeMS",
    "read",
] as const;

type Deferred<T> = T | (() => T | Promise<T>);

export type QueryMock<T> = PromiseLike<T> & {
    [K in (typeof CHAINABLE)[number]]: Mock;
} & { exec: Mock };

/**
 * A thenable stand-in for a mongoose Query.
 *
 * Pass a factory rather than a value to defer errors: an eagerly created
 * rejected promise triggers an unhandledRejection if the handler under test
 * happens not to await it.
 */
export function createQuery<T>(result: Deferred<T>): QueryMock<T> {
    const settle = (): Promise<T> =>
        Promise.resolve(
            typeof result === "function" ? (result as () => T)() : result
        );

    const q: any = {};
    for (const method of CHAINABLE) q[method] = vi.fn(() => q);
    q.exec = vi.fn(() => settle());
    q.then = (onOk: any, onErr: any) => settle().then(onOk, onErr);
    q.catch = (onErr: any) => settle().catch(onErr);
    q.finally = (cb: any) => settle().finally(cb);
    return q as QueryMock<T>;
}

export function createFailingQuery(error: Error): QueryMock<never> {
    return createQuery<never>(() => Promise.reject(error));
}

/** Wraps a plain object so a handler can call `.toObject()` on it. */
export function asDoc<T extends Record<string, any>>(
    raw: T
): T & { toObject: () => T } {
    return { ...raw, toObject: () => ({ ...raw }) };
}

export function asDocs<T extends Record<string, any>>(rows: T[]) {
    return rows.map(asDoc);
}

const STATICS = [
    "find",
    "findOne",
    "findById",
    "findOneAndUpdate",
    "findOneAndDelete",
    "findByIdAndUpdate",
    "findByIdAndDelete",
    "updateOne",
    "updateMany",
    "deleteOne",
    "deleteMany",
    "insertMany",
    "countDocuments",
    "aggregate",
    "exists",
    "distinct",
] as const;

export type ModelMock = Mock & {
    [K in (typeof STATICS)[number]]: Mock;
} & {
    create: Mock;
    /** Shared spy backing every instance's `.save()`. */
    save: Mock;
    /** Every `new Model(...)` instance, in construction order. */
    instances: any[];
    modelName: string;
};

/**
 * Stand-in for a compiled mongoose model.
 *
 * Callable with `new` because add routes do `new Glucose(payload).save()`,
 * and carries every static the handlers use. Statics resolve `null` (or `[]`
 * for list operations) by default; override per test with
 * `Model.find.mockReturnValue(createQuery(...))`.
 */
export function createModelMock(modelName = "model"): ModelMock {
    const save: Mock = vi.fn(async function (this: any) {
        return asDoc({ _id: "generated-object-id", ...this.$raw });
    });

    const Model = vi.fn(function (this: any, doc: Record<string, any> = {}) {
        Object.assign(this, doc);
        this.$raw = { ...doc };
        this.save = save;
        this.toObject = () => ({ ...doc });
        Model.instances.push(this);
    }) as unknown as ModelMock;

    Model.instances = [];
    Model.save = save;
    Model.modelName = modelName;

    for (const method of STATICS) {
        const returnsMany =
            method === "find" || method === "aggregate" || method === "distinct";
        (Model as any)[method] = vi.fn(() =>
            createQuery<any>(returnsMany ? [] : null)
        );
    }
    Model.create = vi.fn(async (doc: any) =>
        asDoc({ _id: "generated-object-id", ...doc })
    );

    return Model;
}

/** Clears call history and implementations for a set of model mocks. */
export function resetModelMocks(...models: any[]) {
    for (const model of models) {
        model.mockClear?.();
        model.instances.length = 0;
        model.save.mockReset();
        for (const method of STATICS) model[method]?.mockReset();
        model.create.mockReset();
    }
}
