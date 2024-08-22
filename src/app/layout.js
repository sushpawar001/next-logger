import { Inter } from "next/font/google";
import "./globals.css";
import getToken from "@/helpers/getToken";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "FitDose",
    description: "Your daily logger!",
};

export default function RootLayout({ children }) {
    const token = getToken();
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
                <Toaster position="bottom-right" reverseOrder={false} />
            </body>
        </html>
    );
}
