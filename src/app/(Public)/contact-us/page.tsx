import ContactUsForm from "@/components/ContactUsForm";
import Link from "next/link";

export default function ContactUs() {
    return (
        <div className="hero-gradient-reverse flex flex-col h-screen">
            <div className="py-2.5">
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
                                        className="rounded-md md:rounded-lg px-5 lg:my-auto py-1 lg:py-2 text-sm lg:text-base font-semibold text-secondary transition  duration-500 h-full w-full hover:scale-105 hover:border-primary hover:text-primary-dark hover:outline outline-1"
                                        onClick={null}
                                    >
                                        Log in
                                    </button>
                                </Link>
                            </div>
                            <div>
                                <Link href="/signup">
                                    <button
                                        className="rounded-md md:rounded-lg px-5 lg:my-auto py-1 lg:py-2 text-sm lg:text-base font-semibold transition duration-500 h-full w-full hover:-translate-y-1 bg-primary hover:bg-primary-dark hover:outline-primary-dark text-white"
                                        onClick={null}
                                    >
                                        Sign up
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-2.5 lg:px-0 lg:py-5 leading-loose text-wrap flex-grow flex items-center">
                <div className="mx-auto drop-shadow-xl rounded-lg w-[90%] md:w-fit">
                    <ContactUsForm />
                </div>
            </div>
            <div className="bg-gradient-to-r from-primary-ring to-primary-dark text-white text-center flex flex-col gap-2">
                <div className="container flex-shrink flex justify-between py-3 text-sm lg:text-base w-11/12 lg:w-full">
                    <p className="text-left">© Designed by Sushant Pawar</p>
                    <div className="flex gap-2 md:gap-5 text-center">
                        <Link href="/terms-service" className="hover:underline">
                            Terms of Service
                        </Link>
                        <Link
                            href="/privacy-policy"
                            className="hover:underline"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
