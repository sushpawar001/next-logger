import { Dot } from "@/components/app-ui/controls";
import { insulinKind } from "@/helpers/insulinKind";

/** Bolus Aubergine, basal Lavender — the same dot everywhere an insulin is named. */
export default function InsulinDot({ name }: { name: string }) {
    return (
        <Dot
            className={
                insulinKind(name) === "basal"
                    ? "bg-brand-lavender"
                    : "bg-brand-aubergine"
            }
        />
    );
}
