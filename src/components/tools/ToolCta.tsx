"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackPwaEvent } from "@/lib/pwa";
import { getTool, type ToolDef } from "@/lib/tools/registry";

/**
 * Signup prompt for a tool page. Calculators render it inside their result
 * card, so it only appears once the visitor has a result: the pitch lands
 * after the payoff, not before it.
 */
export default function ToolCta({
    slug,
    cta = getTool(slug).cta,
}: {
    /** Reported with the click event; also looks up the copy by default. */
    slug: string;
    /** Copy for a page that is not a registered tool, such as a hub. */
    cta?: ToolDef["cta"];
}) {
    return (
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-gray-900">{cta.heading}</p>
            <p className="mt-1 text-sm text-gray-700">{cta.body}</p>
            <Button asChild size="sm" className="mt-3">
                <Link
                    href="/signup"
                    onClick={() =>
                        trackPwaEvent("tool_cta_click", { tool: slug })
                    }
                >
                    {cta.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            </Button>
        </div>
    );
}
