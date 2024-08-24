import React from "react";
import { FaCheck } from "react-icons/fa6";

export default function SecurityPrivacySection() {
    return (
        <div className="bg-[#f7f9fc] flex flex-col justify-center py-10 md:py-5 lg:pb-36">
            <div className="container grid grid-cols-1 md:grid-cols-2 gap-8 px-10">
                <div className="flex flex-col justify-center">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
                        Security & Privacy
                    </h2>
                    <p>
                        Your health data is sensitive. We prioritize your
                        privacy and employ industry-leading security measures to
                        keep your information safe and confidential.
                    </p>
                </div>
                <div className="bg-white p-7 drop-shadow-lg rounded-lg flex flex-col gap-4">
                    <div className="flex gap-4 items-center">
                        <div className="bg-green-500 p-1 rounded-full text-white">
                            <FaCheck />
                        </div>
                        <p>High end encryption</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="bg-green-500 p-1 rounded-full text-white">
                            <FaCheck />
                        </div>
                        <p>Regular security audits</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="bg-green-500 p-1 rounded-full text-white">
                            <FaCheck />
                        </div>
                        <p>Secure Authentication and Authorization</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
