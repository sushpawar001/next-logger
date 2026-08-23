import { NextRequest } from "next/server";

/**
 * Request builders for route-handler tests.
 *
 * No handler in src/app/api reads `nextUrl`, `searchParams`, `cookies()` or
 * `headers()`, so a plain Request would do; NextRequest is used to match the
 * handlers' declared parameter type.
 */
const ORIGIN = "http://localhost:4000";

export function makeRequest(path: string, init?: RequestInit): NextRequest {
    return new NextRequest(new URL(path, ORIGIN), init as any);
}

export function makeJsonRequest(
    path: string,
    body: unknown,
    method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST"
): NextRequest {
    return new NextRequest(new URL(path, ORIGIN), {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    } as any);
}

/** `{ status, body }` in a single await. */
export async function readJson<T = any>(
    res: Response
): Promise<{ status: number; body: T }> {
    return { status: res.status, body: (await res.json()) as T };
}
