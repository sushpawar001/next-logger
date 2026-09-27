import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/tools/jsonLd";

/**
 * Native <details> so the answers are in the server HTML for crawlers and the
 * page needs no JavaScript to expand them. Pass the same array to toolGraph so
 * the FAQPage markup always matches what is on screen.
 */
export default function ToolFaq({ faqs }: { faqs: Faq[] }) {
    if (faqs.length === 0) return null;

    return (
        <section aria-labelledby="tool-faq-heading" className="mt-10">
            <h2
                id="tool-faq-heading"
                className="text-lg md:text-xl font-semibold text-gray-900 mb-4"
            >
                Frequently asked questions
            </h2>
            <div className="rounded-lg border border-border bg-white">
                {faqs.map(({ q, a }) => (
                    <details
                        key={q}
                        className="group border-b border-border last:border-b-0"
                    >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm md:text-base font-medium text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                            {q}
                            <ChevronDown
                                className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                                aria-hidden="true"
                            />
                        </summary>
                        <p className="px-4 pb-4 text-sm leading-relaxed text-gray-700">
                            {a}
                        </p>
                    </details>
                ))}
            </div>
        </section>
    );
}
