import LoadCalc from "@/components/LoadCalc";
import { PageHeader } from "@/components/app-ui/layout";
import type { Metadata } from "next";

// The public copy of this tool lives at /tools/plate-calculator; keep the
// signed-in page out of search results so the two don't compete.
export const metadata: Metadata = {
    robots: { index: false, follow: true },
};

export default function Load() {
    return (
        <>
            <PageHeader
                title="Plate calculator"
                subtitle="Work out which plates to load on each side of the bar."
            />
            <LoadCalc />
        </>
    );
}
