import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const token = request.cookies.get('token')?.value || ''

        if (token) {

            const response = NextResponse.json({
                message: "Logout successful",
            })

            response.cookies.set("token", "", {
                httpOnly: true,
                maxAge: 0
            })
            return response;
        }

    } catch (error) {
        console.log("Error during lgout!: " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}