"use client";
import { useState } from "react";
import { randomGradient2 } from "@/helpers/randomGradient";
import { motion } from "framer-motion";
import { SignIn } from "@clerk/nextjs";

export default function LogInPage() {
    const [gradientArray, setGradientArray] = useState(randomGradient2(12));

    return (
        <motion.div
            className="h-full gradient"
            animate={{
                background: gradientArray,
            }}
            transition={{
                duration: 24,
                repeat: Infinity,
            }}
        >
            <div className="h-full flex justify-center items-center backdrop-blur-sm py-10 px-5 md:px-20">
                <SignIn />
            </div>
        </motion.div>
    );
}
