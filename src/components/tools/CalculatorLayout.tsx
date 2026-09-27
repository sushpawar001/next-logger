import type { ReactNode } from "react";
import EmptyResultsCard from "./EmptyResultsCard";

/**
 * Form and result side by side on desktop, stacked on mobile. Unlike the
 * original calculators it renders the form once, so there are no duplicate
 * ids. `result` is null until the inputs produce a valid answer.
 */
export default function CalculatorLayout({
    form,
    result,
    emptyMessage,
}: {
    form: ReactNode;
    result: ReactNode | null;
    emptyMessage: string;
}) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>{form}</div>
            <div aria-live="polite">
                {result ?? <EmptyResultsCard message={emptyMessage} />}
            </div>
        </div>
    );
}
