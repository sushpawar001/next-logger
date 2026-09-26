import LoadCalc from "@/components/LoadCalc";
import { PageHeader } from "@/components/app-ui/layout";

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
