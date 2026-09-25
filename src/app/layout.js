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
    // Explicit icons are the single source of <link rel="icon"> tags. In Next
    // 14.2 an explicit `metadata.icons` suppresses the tags the src/app/icon.ico
    // file convention would emit (that file is still served at /icon.ico), so
    // there is no duplicate. The SVG comes second so browsers that support it
    // pick the vector; older ones fall back to the .ico.
    icons: {
        icon: [
            { url: "/icon.ico", sizes: "any" },
            { url: "/brand/favicon/favicon.svg", type: "image/svg+xml" },
        ],
        apple: "/icons/apple-touch-icon.png",
    },
    // Default social card for every route comes from the src/app/opengraph-image.png
    // and twitter-image.png file convention. Don't set `openGraph`/`twitter` here or
    // in a child segment without `images`: Next's merge is shallow, and a child
    // `openGraph` object replaces the parent's, dropping the default image.
};

// Must be a separate export in Next 14 — themeColor inside `metadata` is deprecated.
// Single value: the .dark CSS variables exist but nothing ever toggles the class.
export const viewport = {
    themeColor: "#4A3470",
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
