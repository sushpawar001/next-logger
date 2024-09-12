import React from "react";
import { IoClose, IoAlertCircleOutline, IoCheckmark } from "react-icons/io5";
import Link from "next/link";

export default function PricingSection() {
    return (
        <section className="w-full py-16 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-10">
                    <h2 className="font-bold tracking-tighter text-2xl md:text-3xl lg:text-5xl">
                        Choose Your FitDose Plan
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Start your health journey today with our powerful
                        tracking tools
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                    {/* Self-Hosted Plan */}
                    <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-2xl font-semibold">
                                Self-Hosted
                            </h3>
                            <p className="text-base text-gray-500 mt-1">
                                For tech-savvy users
                            </p>
                            <div className="mt-4 text-3xl md:text-4xl font-bold">
                                Free
                            </div>
                            <ul className="mt-6 space-y-4">
                                <li className="flex items-start">
                                    <IoCheckmark className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                                    <span>Full access to features</span>
                                </li>
                                <li className="flex items-start">
                                    <IoCheckmark className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                                    <span>Host on your infrastructure</span>
                                </li>
                                <li className="flex items-start">
                                    <IoClose className="h-6 w-6 text-red-500 mr-2 flex-shrink-0" />
                                    <span className="text-gray-500">
                                        Manual Updates Required
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <IoClose className="h-6 w-6 text-red-500 mr-2 flex-shrink-0" />
                                    <span className="text-gray-500">
                                        Limited support
                                    </span>
                                </li>
                            </ul>
                        </div>
                        <div className="px-6 pt-6 pb-8">
                            <a
                                href="https://github.com/sushpawar001/next-logger"
                                target="_blank"
                            >
                                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition">
                                    Download Source
                                </button>
                            </a>
                        </div>
                    </div>

                    {/* Hosted Solution Plan */}
                    <div className="border-2 border-primary rounded-lg shadow-lg overflow-hidden relative pt-6 sm:pt-0">
                        <div className="absolute top-0 right-0 m-4 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                            RECOMMENDED
                        </div>
                        <div className="p-6">
                            <h3 className="text-2xl font-semibold">
                                Hosted Solution
                            </h3>
                            <p className="text-gray-500 mt-1">
                                For hassle-free experience
                            </p>
                            <div className="mt-4 text-3xl md:text-4xl font-bold text-primary">
                                $5
                                <span className="text-base md:text-lg font-normal text-gray-600">
                                    /month
                                </span>
                            </div>
                            <ul className="mt-6 space-y-4">
                                <li className="flex items-start">
                                    <IoCheckmark className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                                    <span>
                                        All features of self-hosted version
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <IoCheckmark className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                                    <span>
                                        Automatic updates and maintenance
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <IoCheckmark className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                                    <span>Premium support</span>
                                </li>
                                <li className="flex items-start">
                                    <IoCheckmark className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                                    <span>99.9% uptime guarantee</span>
                                </li>
                            </ul>
                            <div className="mt-6 bg-gray-100 p-4 rounded-lg flex items-start space-x-2">
                                <IoAlertCircleOutline className="h-6 w-6 text-primary flex-shrink-0" />
                                <p className="text-sm text-gray-600">
                                    <strong>Save 20%</strong> with annual
                                    billing. That&apos;s 2 months free!
                                </p>
                            </div>
                        </div>
                        <div className="px-6 pb-8">
                            <Link href="/signup">
                                <button className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition">
                                    Start Your 30-Day Free Trial
                                </button>
                            </Link>
                            <p className="mt-2 text-xs text-center text-gray-500">
                                No credit card required
                            </p>
                        </div>
                    </div>
                </div>
                {/* <div className="mt-12 text-center">
                    <p className="text-lg font-semibold">Still not sure?</p>
                    <p className="mt-2 text-gray-600">
                        Check out our{" "}
                        <a href="#" className="text-primary hover:underline">
                            feature comparison
                        </a>{" "}
                        or{" "}
                        <a href="#" className="text-primary hover:underline">
                            contact our sales team
                        </a>
                        .
                    </p>
                </div> */}
            </div>
        </section>
    );
}
