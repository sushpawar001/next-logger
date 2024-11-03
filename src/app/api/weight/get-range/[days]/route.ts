import { connectDB } from "@/dbConfig/connectDB";
import Weight from "@/models/weightModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function GET(request: NextRequest, { params }) {
    try {
        const { days } = params;
        const user = await getUserObjectId();

        let daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);
        daysAgo.setHours(0, 0, 0, 0);

        let prevDaysAgo = new Date();
        prevDaysAgo.setDate(prevDaysAgo.getDate() - days * 2);
        prevDaysAgo.setHours(0, 0, 0, 0);

        const data = await Weight.find({
            user: user,
            createdAt: { $gt: prevDaysAgo },
        }).sort({ createdAt: -1 });

        const daysAgoData = data.filter((d) => d.createdAt > daysAgo);
        const prevDaysAgoData = data.filter(
            (d) => d.createdAt < daysAgo && d.createdAt > prevDaysAgo
        );
        return NextResponse.json({ data: { daysAgoData, prevDaysAgoData } });
    } catch (error) {
        console.log("Error getting weight data " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
