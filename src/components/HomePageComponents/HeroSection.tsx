import React from "react";
import Link from "next/link";
import Image from "next/image";
import runningImage from "../../../public/images/Fitness stats-amico.svg";

export default function HeroSection() {
    return (
        <div className="h-screen min-h-screen hero-gradient py-2.5 lg:py-5">
            <div className="container flex flex-col h-full px-6 md:px-0">
                <div className="py-2.5 flex justify-between flex-shrink-0">
                    <div className="my-auto">
                        <Link href="/">
                            <h1 className="text-xl xl:text-3xl font-semibold text-secondary">
                                FitDose
                            </h1>
                        </Link>
                    </div>
                    <div className="flex gap-1.5 md:gap-4">
                        <div>
                            <Link href="/login">
                                <button
                                    className="rounded-md md:rounded-xl px-5 lg:my-auto py-1 lg:py-2 text-sm lg:text-base font-semibold text-secondary transition  duration-500 h-full w-full hover:scale-105 hover:border-primary hover:text-primary-dark hover:outline outline-1"
                                    onClick={null}
                                >
                                    Log in
                                </button>
                            </Link>
                        </div>
                        <div>
                            <Link href="/signup">
                                <button
                                    className="rounded-md md:rounded-xl px-5 lg:my-auto py-1 lg:py-2 text-sm lg:text-base font-semibold transition duration-500 h-full w-full hover:-translate-y-1 bg-primary hover:bg-primary-dark hover:outline-primary-dark text-white"
                                    onClick={null}
                                >
                                    Sign up
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 h-full flex-grow">
                    <div className="m-auto md:w-3/4">
                        <Image
                            priority
                            src={runningImage}
                            alt="Girl monitoring health metrics"
                            quality={100}
                        />
                        {/* <a href="https://storyset.com/people">People illustrations by Storyset</a> */}
                    </div>
                    <div className="flex flex-col justify-center gap-4 md:gap-6">
                        <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-secondary">
                            Take Control of Your Health with{" "}
                            <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                                Precision Data Tracking
                            </span>
                        </h1>
                        <p>
                            Effortlessly manage insulin, blood glucose, and
                            fitness metrics—designed for better health.
                        </p>
                        <Link href="/signup">
                            <button
                                className="rounded-md md:rounded-xl px-5 py-1.5 lg:py-2.5 text-sm lg:text-base font-semibold transition duration-500 w-fit md:w-1/3 hover:-translate-y-1 bg-gradient-to-r from-primary-ring to-primary-dark text-white"
                                onClick={null}
                            >
                                Join Now for Free
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
