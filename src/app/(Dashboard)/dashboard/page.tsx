import DiabetesDashboard from "@/components/Dashboards/DiabetesDashboard";
import { getGlucoseByDay, getWeightByDay } from "@/helpers/dataFetchHelpers";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { glucose, weight } from "@/types/models";

export default async function Dashboard() {
    const user = await getUserObjectId();
    const glucoseData = (await getGlucoseByDay(7, user)) as glucose[];
    const weightData = (await getWeightByDay(7, user)) as weight[];

    return (
        <DiabetesDashboard
            initialGlucoseData={glucoseData}
            initialWeightData={weightData}
        />
    );
}
