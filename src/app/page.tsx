import HeroSection from "@/components/HomePageComponents/HeroSection";
import FeaturesSection from "@/components/HomePageComponents/FeaturesSection";
import DonateSection from "@/components/HomePageComponents/DonateSection";
import SecurityPrivacySection from "@/components/HomePageComponents/SecurityPrivacySection";
import PricingSection from "@/components/HomePageComponents/PricingSection";
import Footer from "@/components/HomePageComponents/Footer";

export default function HomePage() {
    return (
        <div>
            <HeroSection />
            <FeaturesSection />
            <SecurityPrivacySection />
            <PricingSection/>
            <Footer />
        </div>
    );
}
