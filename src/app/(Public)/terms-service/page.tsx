import Link from "next/link";
import React from "react";

export default function TermsService() {
    return (
        <div className="hero-gradient">
            <div className="h-[40vh] lg:h-[60vh] py-2.5 lg:py-5">
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
                    <div className="h-full flex flex-grow text-center items-center justify-center">
                        <div>
                            <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-secondary mb-2 bg-gradient-to-br from-[#503ac8] to-[#8384f6]  text-transparent bg-clip-text p-1">
                                Terms of Service
                            </h1>
                            <p className="font-light">
                                Last updated: August 31, 2024
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hero-gradient-reverse p-2.5 lg:px-0 lg:py-5 leading-loose text-wrap">
                <div className="max-w-screen-xl mx-auto drop-shadow-xl rounded-lg -mt-28">
                    <div className="bg-white py-5 px-7 rounded-lg">
                        <p>
                            Welcome to FitDose (&quot;the Website&quot;). By
                            accessing or using the Website, you agree to comply
                            with and be bound by the following Terms of Service
                            (&quot;Terms&quot;). Please read these Terms
                            carefully before using our services.
                        </p>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By registering, accessing, or using the Website, you
                            agree to be bound by these Terms. If you do not
                            agree with these Terms, please do not use the
                            Website.
                        </p>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            2. Description of Services
                        </h2>
                        <p>
                            FitDose provides users with tools to log and track
                            personal health data, including but not limited to
                            weight, body measurements, blood glucose levels, and
                            insulin intake (&quot;the Services&quot;). The
                            Website is intended for personal use only and does
                            not replace professional medical advice, diagnosis,
                            or treatment.
                        </p>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            3. Eligibility
                        </h2>
                        <p>
                            You must be at least 18 years old to use the
                            Website. By using the Website, you represent and
                            warrant that you are at least 18 years old and have
                            the legal capacity to enter into these Terms.
                        </p>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            4. User Account
                        </h2>
                        <p>
                            To use certain features of the Website, you may need
                            to create an account. You agree to provide accurate
                            and complete information during the registration
                            process and to update such information as necessary.
                            You are responsible for maintaining the
                            confidentiality of your account credentials and for
                            all activities that occur under your account.
                        </p>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            5. Privacy and Data Security
                        </h2>
                        <p>
                            Your privacy is important to us. Our{" "}
                            <Link
                                href="/privacy-policy"
                                className="text-primary hover:underline hover:underline-offset-2"
                            >
                                Privacy Policy
                            </Link>{" "}
                            explains how we collect, use, and protect your
                            personal information. By using the Website, you
                            agree to the collection and use of your data as
                            described in our Privacy Policy.
                        </p>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            6. Health Disclaimer
                        </h2>
                        <p>
                            The Website is intended for informational and
                            personal tracking purposes only. The data you enter,
                            and the reports generated by the Website, are not
                            intended to diagnose, treat, cure, or prevent any
                            disease. Always seek the advice of a qualified
                            healthcare professional with any questions you may
                            have regarding a medical condition.
                        </p>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            7. User Responsibilities
                        </h2>
                        <ul className="list-disc list-outside p-7">
                            <li>
                                <strong>Accuracy of Data:</strong> You are
                                responsible for ensuring the accuracy of the
                                data you enter into the Website.
                            </li>
                            <li>
                                <strong>Compliance with Laws:</strong> You agree
                                to comply with all applicable laws and
                                regulations when using the Website.
                            </li>
                            <li>
                                <strong>Personal Use Only:</strong> The Website
                                is for your personal use only. You may not use
                                the Website for any commercial purposes without
                                our prior written consent.
                            </li>
                        </ul>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            8. Prohibited Conduct
                        </h2>
                        <p>You agree not to:</p>
                        <ul className="list-disc list-outside p-7">
                            <li>
                                Use the Website for any unlawful or fraudulent
                                purpose.
                            </li>
                            <li>
                                Post or transmit any material that is harmful,
                                offensive, or otherwise inappropriate.
                            </li>
                            <li>
                                Interfere with the operation of the Website or
                                any other user&quot;s use of the Website.
                            </li>
                            <li>
                                Attempt to gain unauthorized access to the
                                Website, other accounts, or any related computer
                                systems or networks.
                            </li>
                        </ul>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            9. Intellectual Property
                        </h2>
                        <p>
                            All content, features, and functionality on the
                            Website, including but not limited to text,
                            graphics, logos, and software, are the property of
                            FitDose or its licensors and are protected by
                            applicable intellectual property laws. You may not
                            reproduce, distribute, or create derivative works
                            from any content on the Website without our prior
                            written consent.
                        </p>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            10. Limitation of Liability
                        </h2>
                        <p>
                            To the fullest extent permitted by law, FitDose and
                            its affiliates, officers, directors, employees, and
                            agents will not be liable for any direct, indirect,
                            incidental, consequential, or punitive damages
                            arising out of or in connection with your use of the
                            Website, including but not limited to errors or
                            omissions in any content, personal injury, or loss
                            or damage of any kind incurred as a result of your
                            use of the Website.
                        </p>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            11. Indemnification
                        </h2>
                        <p>
                            You agree to indemnify, defend, and hold harmless
                            FitDose, its affiliates, and their respective
                            officers, directors, employees, and agents from any
                            claims, liabilities, damages, losses, costs, or
                            expenses, including reasonable attorneys&quot; fees,
                            arising out of or in any way connected with your use
                            of the Website or violation of these Terms.
                        </p>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            12. Modifications to the Terms
                        </h2>
                        <p>
                            We reserve the right to modify these Terms at any
                            time. Any changes will be effective immediately upon
                            posting on the Website. Your continued use of the
                            Website following any such modifications constitutes
                            your acceptance of the new Terms.
                        </p>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            13. Termination
                        </h2>
                        <p>
                            We may terminate or suspend your access to the
                            Website at our sole discretion, without prior
                            notice, for any reason, including but not limited to
                            a breach of these Terms.
                        </p>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            14. Governing Law
                        </h2>
                        <p>
                            These Terms are governed by and construed in
                            accordance with the laws of India, without regard to
                            its conflict of law principles. You agree to submit
                            to the exclusive jurisdiction of the courts located
                            in India for any disputes arising out of or related
                            to these Terms or your use of the Website.
                        </p>

                        <h2 className="font-bold text-2xl md:text-3xl my-3 md:my-5">
                            15. Contact Information
                        </h2>
                        <p>
                            If you have any questions about these Terms, please
                            contact us at{" "}
                            <a
                                href="mailto:fitnationplus@gmail.com"
                                className="text-primary hover:underline hover:underline-offset-2"
                            >
                                fitnationplus@gmail.com
                            </a>
                            .
                        </p>

                        <p className="mt-5 font-semibold">
                            By using the Website, you acknowledge that you have
                            read, understood, and agree to be bound by these
                            Terms of Service.
                        </p>
                    </div>
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
