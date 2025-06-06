import { connectDB } from "@/dbConfig/connectDB";
import Glucose from "@/models/glucoseModel";
import Weight from "@/models/weightModel";
connectDB();

export async function getGlucoseByDay(days: number, userId: string)  {
    let daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const data = await Glucose.find({
        user: userId,
        createdAt: { $gt: daysAgo },
    }).sort({ createdAt: -1 });
    return data.map((item) => item.toObject());
}

export async function getWeightByDay(days: number, userId: string) {
    let daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const data = await Weight.find({
        user: userId,
        createdAt: { $gt: daysAgo },
    }).sort({ createdAt: -1 });
    return data.map((item) => item.toObject());
}
