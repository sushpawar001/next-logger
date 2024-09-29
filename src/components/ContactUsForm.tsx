"use client";
import notify from "@/helpers/notify";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState } from "react";

export default function ContactUsForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    // onsubmit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/contact-us/add", formData);
            notify(response.data.message, "success");
        } catch (error) {
            console.log(error);
            notify(error.response.data.error, "error");
        }
    };

    // on change handler
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    return (
        <motion.div
            className="bg-white p-5 md:p-7 rounded-lg"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <form
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={handleSubmit}
            >
                <div className="col-span-1 md:col-span-2 text-center">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary mb-2 bg-gradient-to-br from-[#503ac8] to-[#8384f6] text-transparent bg-clip-text p-1">
                        Contact Us
                    </h1>
                </div>
                <div className="w-full">
                    <label
                        htmlFor="name"
                        className="mb-2 text-sm font-medium text-secondary dark:text-white"
                    >
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="bg-gray-50 border border-stone-400  text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5"
                        placeholder="John Doe"
                        required
                        onChange={handleChange}
                    />
                </div>
                <div className="w-full">
                    <label
                        htmlFor="email"
                        className="mb-2 text-sm font-medium text-secondary dark:text-white"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="bg-gray-50 border border-stone-400  text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5"
                        placeholder="john.doe@me.com"
                        required
                        onChange={handleChange}
                    />
                </div>
                <div className="w-full col-span-1 md:col-span-2">
                    <label
                        htmlFor="message"
                        className="mb-2 text-sm font-medium text-secondary dark:text-white"
                    >
                        Full Name
                    </label>
                    <textarea
                        id="message"
                        className="bg-gray-50 border border-stone-400  text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5"
                        placeholder="Write your message here..."
                        rows={4}
                        required
                        onChange={handleChange}
                    />
                </div>
                <div className="col-span-1 md:col-span-2 flex">
                    <button
                        type="submit"
                        className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-xl text-sm w-full py-2.5 text-center transition duration-300 mx-auto"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
