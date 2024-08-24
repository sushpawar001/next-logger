import HeroSection from "@/components/HomePageComponents/HeroSection";
import FeaturesSection from "@/components/HomePageComponents/FeaturesSection";
import DonateSection from "@/components/HomePageComponents/DonateSection";
import SecurityPrivacySection from "@/components/HomePageComponents/SecurityPrivacySection";

export default function HomePage() {
    return (
        <div>
            <HeroSection />
            <FeaturesSection />
            <SecurityPrivacySection />
            <DonateSection />
        </div>
    );
}
