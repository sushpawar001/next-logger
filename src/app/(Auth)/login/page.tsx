"use client";
import notify from "@/helpers/notify";
import { randomGradient, randomGradient2 } from "@/helpers/randomGradient";
import axios from "axios";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LogIn() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

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
            const response = await axios.post("/api/users/login/", formData);
            if (response.status === 200) {
                notify("Login Successful!", "success");
                router.push("/");
                router.refresh();
            }
        } catch (error) {
            console.log("error: ", error);
            notify(error.response.data.error, "error");
        }
    };
    return (
        <motion.div
            className="h-full bg-primary-ring"
            animate={{
                background: randomGradient2(12),
                // backgroundColor: ["#E0E0E0", "#E0E0E0", "#E0E0E0", "#E0E0E0", "#E0E0E0", "#E0E0E0"]
            }}
            transition={{
                duration: 24,
                repeat: Infinity,
            }}
        >
            <div className="h-full flex justify-center items-center backdrop-blur-sm py-10 px-5 md:px-20">
                <div className="mx-auto w-full max-w-lg rounded-xl bg-white px-4 md:px-10 py-10 md:py-16 text-center shadow-md">
                    <div className="mb-6 text-xl md:text-3xl font-bold">
                        <h1 className="text-secondary">Login</h1>
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
                                className="w-full rounded-xl border border-stroke bg-transparent p-2.5 md:px-5 md:py-3 text-body-color outline-none focus:border-primary-ring focus-visible:shadow-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-xl w-full px-5 py-1.5 md:py-2.5 text-center transition duration-300"
                        >
                            Login
                        </button>
                        <p className="mt-2 text-sm">
                            Don&apos;t have an account?{" "}
                            <a href="/signup" className="text-primary">
                                Signup
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
