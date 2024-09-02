"use client";
import { useState } from "react";
import notify from "@/helpers/notify";
import axios from "axios";
import { randomGradient2 } from "@/helpers/randomGradient";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
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
                <SignUp />
            </div>
        </motion.div>
    );
}
