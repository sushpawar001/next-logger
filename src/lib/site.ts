/**
 * The canonical origin of the site, used for metadataBase, robots.txt, the
 * sitemap and JSON-LD. `NEXT_PUBLIC_BASE_URL` wins when set; otherwise a
 * production build falls back to the live domain rather than localhost, so a
 * missing env var can never leak localhost URLs into canonical tags.
 */
export const PRODUCTION_URL = "https://fitdose.fitnationplus.com";

export function getSiteUrl(): string {
    const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.trim();
    if (fromEnv) return fromEnv.replace(/\/+$/, "");
    return process.env.NODE_ENV === "production"
        ? PRODUCTION_URL
        : "http://localhost:4000";
}

export function absoluteUrl(path: string): string {
    return new URL(path, `${getSiteUrl()}/`).toString();
}
