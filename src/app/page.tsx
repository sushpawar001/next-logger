import type { Metadata } from "next";
import HomeNav from "@/components/HomePageComponents/HomeNav";
import HomeHero from "@/components/HomePageComponents/HomeHero";
import HomeFeatures from "@/components/HomePageComponents/HomeFeatures";
import HomePrivacy from "@/components/HomePageComponents/HomePrivacy";
import HomePricing from "@/components/HomePageComponents/HomePricing";
import HomeFaq from "@/components/HomePageComponents/HomeFaq";
import HomeTools from "@/components/HomePageComponents/HomeTools";
import HomeCta from "@/components/HomePageComponents/HomeCta";
import HomeFooter from "@/components/HomePageComponents/HomeFooter";

// Title/description only: setting `openGraph` here would replace the root
// layout's and drop the default social image (see the note in layout.js).
export const metadata: Metadata = {
    title: "FitDose — a calm, private log for glucose, insulin and weight",
    description:
        "Log blood glucose, insulin doses, weight and body measurements in a few taps. Charts, averages and a PDF for your doctor — encrypted before it’s stored.",
};

export default function HomePage() {
    return (
        <div className="min-h-screen bg-brand-cream text-brand-ink">
            <a
                href="#main"
                className="absolute left-[-9999px] top-3 z-20 rounded-lg bg-brand-ink px-4 py-3 font-semibold text-brand-cream focus:left-4"
            >
                Skip to content
            </a>
            <HomeNav />
            <main id="main" tabIndex={-1} className="focus:outline-hidden">
                <HomeHero />
                <HomeFeatures />
                <HomePrivacy />
                <HomePricing />
                <HomeFaq />
                <HomeTools />
                <HomeCta />
            </main>
            <HomeFooter />
        </div>
    );
}
