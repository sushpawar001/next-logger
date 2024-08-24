import React from "react";
import { FaHeartCircleCheck } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";
import AnimatedCard from "./AnimatedCard";

export default function FeaturesSection() {
    return (
        <div className="min-h-[85vh] bg-[#f7f9fc] flex flex-col justify-center py-10 md:py-5">
            <div className="container flex flex-col gap-8 md:gap-12">
                <div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-secondary">
                        Powerful Features for Your Health Journey
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-6">
                    <AnimatedCard
                        icon={<FaHeartCircleCheck />}
                        heading={"Handy Health Monitoring"}
                        description={
                            "Easily track your health with daily logs and visualize your data over time to manage your health effectively."
                        }
                    />
                    <AnimatedCard
                        icon={<FaChartLine />}
                        heading={"Comprehensive Body Stats"}
                        description={
                            "See health stats and trends based on your data to help you better understand your health patterns."
                        }
                    />
                    <AnimatedCard
                        icon={<FaLock />}
                        heading={"Secure Data Management"}
                        description={
                            "Rest assured that your sensitive health data is securely stored and protected with top-tier encryption"
                        }
                    />
                </div>
            </div>
        </div>
    );
}
