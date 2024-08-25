"use client";
import notify from "@/helpers/notify";
import { randomGradient2 } from "@/helpers/randomGradient";
import axios from "axios";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [hashedToken, setHashedToken] = useState("");
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
        hashedToken: "",
    });
    const [error, setError] = useState(false);
    const [formError, setFormError] = useState(false);
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

    useEffect(() => {
        const urlToken = window.location.search.split("=")[1];
        setHashedToken(urlToken || "");
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        try {
            formData.hashedToken = hashedToken;
            const response = await axios.post(
                "/api/users/reset-password/",
                formData
            );
            if (response.status === 200) {
                notify("Password changed successfully!", "success");
                router.push("/login");
            }
        } catch (error) {
            console.log("error: ", error);
            notify(error.response.data.error, "error");
        }
    };

    useEffect(() => {
        if (formData.password !== formData.confirmPassword) {
            setFormError(true);
        } else {
            setFormError(false);
        }
    }, [formData.confirmPassword, formData.password]);

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
                        <h1 className="text-secondary">Reset Password</h1>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Enter your password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                minLength={8}
                                className="w-full rounded-xl border border-stroke bg-transparent p-2.5 md:px-5 md:py-3 text-body-color outline-none focus:border-primary-ring focus-visible:shadow-none"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Confirm your password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                minLength={8}
                                className="w-full rounded-xl border border-stroke bg-transparent p-2.5 md:px-5 md:py-3 text-body-color outline-none focus:border-primary-ring focus-visible:shadow-none"
                            />
                        </div>
                        {formError && (
                            <p className="text-red-500 mb-4">
                                {"Passwords don't match"}
                            </p>
                        )}
                        <button
                            type="submit"
                            className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-xl w-full px-5 py-1.5 md:py-2.5 text-center transition duration-300 disabled:bg-gray-500"
                            disabled={formError}
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
