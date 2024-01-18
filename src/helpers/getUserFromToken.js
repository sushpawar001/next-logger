import jwt from "jsonwebtoken";

export default function getUserFromToken(request) {
    try {
        const token = request.cookies.get("token")?.value || '';
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        // console.log("decodedToken = ", decodedToken.userId)
        return decodedToken.userId;
    } catch (error) {
        throw new Error(error.message);
    }

}