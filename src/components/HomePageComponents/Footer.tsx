import React from "react";
import Link from "next/link";

export default function Footer() {
    return (
        <div className="bg-gradient-to-r from-primary-ring to-primary-dark text-white">
        <div className="container flex-shrink flex justify-between py-3 text-sm lg:text-base w-11/12 lg:w-full">
            <p className="text-left">© Designed by FitnationPlus</p>
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
