/**
 * Placeholder for the list pages (glucose, insulin, weight) while their first
 * window loads. Mirrors the A1 layout: header, hero + side card, filters,
 * chart, then history rows.
 */
const Bar = ({ className = "" }: { className?: string }) => (
    <span
        className={`block animate-pulse rounded-md bg-brand-oat ${className}`}
    />
);

const Card = ({
    className = "",
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => (
    <div
        className={`min-w-0 rounded-2xl border border-border bg-white p-5 lg:p-6 ${className}`}
    >
        {children}
    </div>
);

const LoadingSkeleton = () => (
    <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading…</span>
        <div className="mb-4 lg:mb-6">
            <Bar className="h-8 w-40" />
            <Bar className="mt-2 h-4 w-64 max-w-full" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
            <Card className="lg:col-span-8">
                <Bar className="h-3 w-28" />
                <Bar className="mt-4 h-14 w-48" />
                <Bar className="mt-4 h-6 w-40" />
            </Card>
            <Card className="lg:col-span-4">
                <Bar className="h-5 w-32" />
                {[0, 1, 2, 3].map((i) => (
                    <Bar key={i} className="mt-4 h-3 w-full" />
                ))}
            </Card>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 lg:mt-5">
            <Bar className="h-9 w-80 max-w-full rounded-lg" />
            <Bar className="h-8 w-56 max-w-full rounded-2xl" />
        </div>

        <Card className="mt-4 lg:mt-5">
            <Bar className="h-[220px] w-full rounded-xl" />
        </Card>

        <Card className="mt-4 lg:mt-5">
            <Bar className="mb-5 h-5 w-24" />
            {[0, 1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 border-t border-border py-3 first-of-type:border-t-0"
                >
                    <Bar className="h-4 w-16" />
                    <Bar className="h-4 w-12" />
                    <Bar className="h-4 w-24" />
                    <Bar className="ml-auto h-6 w-20 rounded-xl" />
                </div>
            ))}
        </Card>
    </div>
);

export { LoadingSkeleton };
