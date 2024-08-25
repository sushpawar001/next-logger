"use client";
import notify from "@/helpers/notify";
import { randomGradient2 } from "@/helpers/randomGradient";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Verify() {
    const [gradientArray, setGradientArray] = useState(randomGradient2(12));
    const router = useRouter();
    const [hashedToken, setHashedToken] = useState("");
    const [error, setError] = useState(false);

    const verifyUserEmail = async () => {
        try {
            const response = await axios.post("/api/users/verify-email", { hashedToken });

            if (response.status === 200) {
                notify("Email verified successfully!", "success");
                router.push("/login");
            }
            
        } catch (error: any) {
            setError(true);
            notify(error.response.data.error, "error");
            console.log(error);
        }
    };

    useEffect(() => {
        const urlToken = window.location.search.split("=")[1];
        setHashedToken(urlToken || "");
    }, []);

    return (
        <motion.div
            className="h-full gradient"
            animate={{
                background: gradientArray,
                // backgroundColor: ["#E0E0E0", "#E0E0E0", "#E0E0E0", "#E0E0E0", "#E0E0E0", "#E0E0E0"]
            }}
            transition={{
                duration: 24,
                repeat: Infinity,
            }}
        >
            <div className="h-full flex justify-center items-center backdrop-blur-sm py-10 px-5 md:px-20">
                <div className="mx-auto w-full max-w-lg rounded-xl bg-white px-4 md:px-10 py-10 md:py-16 text-center shadow-lg">
                    <div className="mb-6 text-xl md:text-3xl font-bold">
                        <h1 className="text-secondary">Verify your account</h1>
                    </div>
                    <button
                        type="submit"
                        className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-xl w-full lg:w-2/3 px-5 py-1.5 md:py-2.5 text-center transition duration-300"
                        onClick={verifyUserEmail}
                    >
                        Verify
                    </button>
                    {error && <p className="text-red-500 mt-2">Invalid token</p>}
                </div>
            </div>
        </motion.div>
    );
}
