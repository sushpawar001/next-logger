import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CLUSTERS, getTool, relatedTools } from "@/lib/tools/registry";

export default function RelatedTools({ slug }: { slug: string }) {
    const tool = getTool(slug);
    const related = relatedTools(slug);
    const cluster = CLUSTERS.find((c) => c.id === tool.cluster);

    return (
        <section aria-labelledby="related-tools-heading" className="mt-10">
            <div className="flex items-baseline justify-between gap-4 mb-4">
                <h2
                    id="related-tools-heading"
                    className="text-lg md:text-xl font-semibold text-gray-900"
                >
                    Related calculators
                </h2>
                <Link
                    href={`/tools#${tool.cluster}`}
                    className="text-sm font-medium text-primary hover:underline"
                >
                    All {cluster?.label.toLowerCase()} tools
                </Link>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {related.map((item) => {
                    const Icon = item.icon;
                    return (
                        <li key={item.slug}>
                            <Link
                                href={item.href}
                                className="group flex h-full items-start gap-3 rounded-lg border border-border bg-white p-4 transition-colors hover:border-primary"
                            >
                                <span className="rounded-md bg-primary/10 p-2 text-primary">
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <span className="flex flex-col gap-1">
                                    <span className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                                        {item.title}
                                        <ArrowRight
                                            className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        {item.description}
                                    </span>
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
