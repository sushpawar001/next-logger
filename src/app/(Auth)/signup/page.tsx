"use client";
import React, { useState } from "react";
import notify from "@/helpers/notify";
import axios from "axios";
import { randomGradient2 } from "@/helpers/randomGradient";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function SignUp() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [gradientArray, setGradientArray] = useState(randomGradient2(12));
    const handleInputChange = (event: {
        target: { name: string; value: string };
    }) => {
        const { name, value }: { name: string; value: string } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/users/signup/", formData);
            if (response.status === 200) {
                notify("Signup Successful!", "success");
                router.push("/login");
            }
        } catch (error) {
            console.log("error: ", error);
            notify(error.response.data.error, "error");
        }
    };

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
                        <h1>Sign Up</h1>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-stroke bg-transparent p-2.5 md:px-5 md:py-3 text-body-color outline-none focus:border-primary-ring focus-visible:shadow-none"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Enter password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                minLength={8}
                                className="w-full rounded-xl border border-stroke bg-transparent p-2.5 md:px-5 md:py-3 text-body-color outline-none focus:border-primary-ring focus-visible:shadow-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-xl w-full px-5 py-1.5 md:py-2.5 text-center transition duration-300"
                        >
                            Sign Up
                        </button>
                        <p className="mt-2 text-sm">
                            Already have an account?{" "}
                            <a href="/login" className="text-primary">
                                Login
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
