import { serializeJsonLd, type JsonLdObject } from "@/lib/tools/jsonLd";

/**
 * Structured data as a native script tag, per Next's JSON-LD guide
 * (node_modules/next/dist/docs/01-app/02-guides/json-ld.md). Not next/script:
 * JSON-LD is data, not executable code.
 */
export default function JsonLd({ data }: { data: JsonLdObject }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
    );
}
