import Link from "next/link";
import type { ReactNode } from "react";
import CopyUrlButton from "@/components/CopyUrlButton";
import { getTool } from "@/lib/tools/registry";
import { toolGraph, type Faq } from "@/lib/tools/jsonLd";
import FormulaSource, { type FormulaSourceProps } from "./FormulaSource";
import JsonLd from "./JsonLd";
import RelatedTools from "./RelatedTools";
import ToolDisclaimer from "./ToolDisclaimer";
import ToolFaq from "./ToolFaq";

interface ToolPageShellProps {
    slug: string;
    intro: ReactNode;
    faqs: Faq[];
    /** Server-rendered reference tables shown under the calculator. */
    reference?: ReactNode;
    formula?: Omit<FormulaSourceProps, "lastReviewed">;
    disclaimer?: "general" | "diabetes";
    /** The calculator itself. */
    children: ReactNode;
}

/**
 * Common frame for every /tools page: breadcrumb, heading, calculator,
 * reference content, method, disclaimer, FAQ, related tools and JSON-LD.
 * The heading and structured data come from the tools registry.
 */
export default function ToolPageShell({
    slug,
    intro,
    faqs,
    reference,
    formula,
    disclaimer = "general",
    children,
}: ToolPageShellProps) {
    const tool = getTool(slug);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <nav aria-label="Breadcrumb" className="mb-3 text-xs text-gray-500">
                <ol className="flex flex-wrap items-center gap-1">
                    <li>
                        <Link href="/" className="hover:text-gray-900">
                            Home
                        </Link>
                    </li>
                    <li aria-hidden="true">/</li>
                    <li>
                        <Link href="/tools" className="hover:text-gray-900">
                            Tools
                        </Link>
                    </li>
                    <li aria-hidden="true">/</li>
                    <li aria-current="page" className="text-gray-700">
                        {tool.title}
                    </li>
                </ol>
            </nav>
            <div className="mb-4 md:mb-8">
                <div className="flex items-center justify-between gap-3 mb-2">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                        {tool.h1}
                    </h1>
                    <CopyUrlButton showEncouragement={true} />
                </div>
                <div className="text-gray-600 text-sm md:text-base">{intro}</div>
            </div>

            {children}

            {reference && <div className="mt-8">{reference}</div>}

            {formula && (
                <FormulaSource {...formula} lastReviewed={tool.lastReviewed} />
            )}
            <ToolDisclaimer variant={disclaimer} />
            <ToolFaq faqs={faqs} />
            <RelatedTools slug={slug} />
            <JsonLd data={toolGraph(tool, faqs)} />
        </div>
    );
}
