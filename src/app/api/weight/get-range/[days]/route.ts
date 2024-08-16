import { connectDB } from "@/dbConfig/connectDB";
import Weight from "@/models/weightModel";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function GET(request, { params }) {
    try {
        const { days } = params;
        const user = getUserFromToken(request);

        let daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);

        let prevDaysAgo = new Date();
        prevDaysAgo.setDate(daysAgo.getDate() - days * 2);
        // console.log("daysAgo", daysAgo);
        // console.log("prevDaysAgo", prevDaysAgo);

        const data = await Weight.find({
            user: user,
            createdAt: { $gt: prevDaysAgo },
        }).sort({ createdAt: -1 });

        const daysAgoData = data.filter((d) => d.createdAt > daysAgo);
        const prevDaysAgoData = data.filter(
            (d) => d.createdAt < daysAgo && d.createdAt > prevDaysAgo
        );
        // console.log("daysAgoData:", daysAgoData);
        // console.log("prevDaysAgoData:", prevDaysAgoData);
        return NextResponse.json({ data: { daysAgoData, prevDaysAgoData } });
    } catch (error) {
        console.log("Error getting weight data " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
