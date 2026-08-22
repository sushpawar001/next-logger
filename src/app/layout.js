import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import PwaBootstrap from "@/components/pwa/PwaBootstrap";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4000"
    ),
    title: "FitDose",
    description: "Your daily logger!",
    applicationName: "FitDose",
    appleWebApp: {
        capable: true,
        title: "FitDose",
        // "default" keeps a readable light status bar. "black-translucent" would
        // render the app under the clock and need safe-area work on every screen.
        statusBarStyle: "default",
    },
    formatDetection: { telephone: false },
    icons: {
        icon: "/icon.ico",
        apple: "/icons/apple-touch-icon.png",
    },
};

// Must be a separate export in Next 14 — themeColor inside `metadata` is deprecated.
export const viewport = {
    themeColor: "#5E4AE3",
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <NuqsAdapter>
                    {children}
                </NuqsAdapter>
                <Toaster position="bottom-right" reverseOrder={false} />
                <PwaBootstrap />
            </body>
            <GoogleAnalytics gaId={process.env.GA_ID} />
        </html>
    );
}
