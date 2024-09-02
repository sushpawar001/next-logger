import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse, NextRequest } from "next/server";
// import { getUserObjectId } from "@/helpers/getUserObjectId";
import InsulinType from "@/models/insulinTypeModel";

connectDB();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { name } = body;
    name = name.trim();
    // const user = await getUserObjectId();

    const oldInsulin = await InsulinType.findOne({ name });
    if (oldInsulin) {
      return NextResponse.json(
        { error: `${name} Insulin already exists` },
        { status: 400 }
      );
    }

    const entry = await InsulinType.create({ name });
    return NextResponse.json({ entry, message: `${name} insulin added!` });
  } catch (error) {
    console.log("Error adding Insulin Type" + error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
