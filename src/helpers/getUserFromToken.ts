import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export default function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || "";
    const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET);
    return decodedToken.userId;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
