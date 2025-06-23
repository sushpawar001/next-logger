import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "FitDose",
    description: "Your daily logger!",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <NuqsAdapter>
                    {children}
                </NuqsAdapter>
                <Toaster position="bottom-right" reverseOrder={false} />
            </body>
            <GoogleAnalytics gaId={process.env.GA_ID} />
        </html>
    );
}
