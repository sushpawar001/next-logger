// import "./globals.css";
import getToken from "@/helpers/getToken";

export const metadata = {
    title: "FitDose",
    description: "Your daily logger!",
};

export default function RootLayout({ children }) {
    const token = getToken();
    return <div className="h-screen">{children}</div>;
}
