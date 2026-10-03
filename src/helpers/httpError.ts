/**
 * An error that carries the HTTP status a route handler should answer with.
 *
 * Route handlers share one `try/catch` that used to turn every throw into a
 * 500, so a signed-out caller got a server error rather than a 401. Throwing
 * this instead lets the catch pick the right status via `errorStatus`.
 *
 * Kept out of getUserObjectId.ts on purpose: the route tests mock that module
 * wholesale, and the class has to survive the mock.
 */
export class HttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

/** The status for a caught error: its own if it is an HttpError, else 500. */
export function errorStatus(error: unknown): number {
    return error instanceof HttpError ? error.status : 500;
}
