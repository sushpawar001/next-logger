import { Info } from "lucide-react";

const COPY = {
    general:
        "This calculator gives an estimate for general information only. It is not a diagnosis or medical advice; talk to a qualified health professional about your own situation.",
    diabetes:
        "This calculator is for education only. It is not a diagnosis and must not be used to change your medication or insulin. Lab results can differ from estimates; always follow your care team’s advice.",
} as const;

export default function ToolDisclaimer({
    variant = "general",
}: {
    variant?: keyof typeof COPY;
}) {
    return (
        <aside
            aria-label="Medical disclaimer"
            className="mt-6 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
            <Info className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <p>{COPY[variant]}</p>
        </aside>
    );
}
