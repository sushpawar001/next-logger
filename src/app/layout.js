import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastContainer } from "react-toastify";
import getToken from "@/helpers/getToken";
import Navbar2 from "@/components/Navbar2";

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
                <ToastContainer />
            </body>
        </html>
    );
}
