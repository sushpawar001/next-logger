import Link from "next/link";
import React from "react";

export default function DonateSection() {
    return (
        <div className="bg-gradient-to-r from-primary-ring to-primary-dark min-h-[50vh] text-white text-center flex flex-col gap-2">
            <div className="container flex-grow flex flex-col justify-center px-6 md:px-0">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
                    Support Us, Keep It Free for Everyone
                </h2>
                <p>
                    All features are free. Your donations help us maintain and
                    improve the platform.
                </p>
                <div className="mt-4 md:mt-6 lg::mt-8">
                    <button
                        className="rounded-md md:rounded-lg px-5 lg:my-auto py-1.5 lg:py-2.5 text-sm lg:text-base font-semibold transition duration-500 w-2/3 lg:w-1/5 hover:-translate-y-1 bg-secondary text-white"
                        onClick={null}
                    >
                        Donate Now
                    </button>
                </div>
            </div>
            {/* footer */}
            <div className="container flex-shrink flex justify-between py-3 border-t text-sm lg:text-base w-11/12 lg:w-full">
                <p className="text-left">© Designed by Sushant Pawar</p>
                <div className="flex gap-2 md:gap-5 text-center">
                    <Link href="/terms-service" className="hover:underline">
                        Terms of Service
                    </Link>
                    <Link href="/privacy-policy" className="hover:underline">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </div>
    );
}
