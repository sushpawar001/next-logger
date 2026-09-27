import { afterEach, describe, expect, it, vi } from "vitest";
import { absoluteUrl, getSiteUrl, PRODUCTION_URL } from "./site";

afterEach(() => {
    vi.unstubAllEnvs();
});

describe("getSiteUrl", () => {
    it("uses NEXT_PUBLIC_BASE_URL when set", () => {
        vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://example.com");

        expect(getSiteUrl()).toBe("https://example.com");
    });

    it("strips trailing slashes from the env value", () => {
        vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://example.com//");

        expect(getSiteUrl()).toBe("https://example.com");
    });

    it("falls back to the live domain in production", () => {
        vi.stubEnv("NEXT_PUBLIC_BASE_URL", "");
        vi.stubEnv("NODE_ENV", "production");

        expect(getSiteUrl()).toBe(PRODUCTION_URL);
    });

    it("falls back to the dev server outside production", () => {
        vi.stubEnv("NEXT_PUBLIC_BASE_URL", "");
        vi.stubEnv("NODE_ENV", "development");

        expect(getSiteUrl()).toBe("http://localhost:4000");
    });
});

describe("absoluteUrl", () => {
    it("joins a path onto the site origin", () => {
        vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://example.com/");

        expect(absoluteUrl("/tools/bmi-calculator")).toBe(
            "https://example.com/tools/bmi-calculator"
        );
    });
});
