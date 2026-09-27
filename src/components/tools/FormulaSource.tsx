export interface Source {
    label: string;
    href: string;
}

export interface FormulaSourceProps {
    /** One or more formulas, shown in monospace. */
    formula: string | string[];
    sources: Source[];
    lastReviewed: string;
}

// lastReviewed is a calendar date, not an instant: format it in UTC so it
// never shifts a day for the reader. (formatDate converts to local time.)
const reviewedFormat = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    dateStyle: "long",
});

export default function FormulaSource({
    formula,
    sources,
    lastReviewed,
}: FormulaSourceProps) {
    const formulas = Array.isArray(formula) ? formula : [formula];

    return (
        <section
            aria-labelledby="formula-heading"
            className="mt-10 rounded-lg border border-border bg-gray-50 p-4 md:p-5"
        >
            <h2
                id="formula-heading"
                className="text-base font-semibold text-gray-900 mb-3"
            >
                How it&apos;s calculated
            </h2>
            <div className="space-y-2">
                {formulas.map((f) => (
                    <code
                        key={f}
                        className="block overflow-x-auto rounded border border-border bg-white px-3 py-2 text-xs md:text-sm text-gray-800"
                    >
                        {f}
                    </code>
                ))}
            </div>
            {sources.length > 0 && (
                <p className="mt-3 text-sm text-gray-700">
                    <span className="font-medium">Sources: </span>
                    {sources.map((source, i) => (
                        <span key={source.href}>
                            <a
                                href={source.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                {source.label}
                            </a>
                            {i < sources.length - 1 ? "; " : ""}
                        </span>
                    ))}
                </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
                Last reviewed{" "}
                <time dateTime={lastReviewed}>
                    {reviewedFormat.format(new Date(lastReviewed))}
                </time>
            </p>
        </section>
    );
}
