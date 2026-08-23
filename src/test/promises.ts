/**
 * A rejected promise that Node will not report as an unhandled rejection.
 *
 * Several components fire a request without catching it -- either no try/catch
 * at all, or `axios.get(...).then(...)` inside a try, where the rejection
 * escapes because nothing awaits it. Driving those paths with a plain
 * `mockRejectedValue` produces a genuine unhandled rejection that fails the
 * whole Vitest run even though the test itself passes.
 *
 * Attaching a no-op catch marks the rejection handled for Node's bookkeeping
 * while the component under test still receives the rejection exactly as it
 * would in the browser.
 */
export function handledRejection(error: unknown): Promise<never> {
    const promise = Promise.reject(error);
    promise.catch(() => {});
    return promise;
}

/** Mock implementation form: a fresh handled rejection on every call. */
export function rejectsWith(error: unknown) {
    return () => handledRejection(error);
}
