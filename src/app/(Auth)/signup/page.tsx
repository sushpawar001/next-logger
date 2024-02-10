"use client";
import React, { useState } from "react";
import notify from "@/helpers/notify";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (event: { target: { name: string; value: string; }; }) => {
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
    <div className="flex h-full justify-center items-center bg-background py-10 px-8 md:px-20">
      <div className="mx-auto w-full max-w-lg rounded-xl bg-white px-10 py-16 text-center shadow-md">
        <div className="mb-6 text-3xl font-bold">
          <h1>Sign Up</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="email"
              placeholder="Enter your email address"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-primary-ring focus-visible:shadow-none"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="Enter password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-primary-ring focus-visible:shadow-none"
            />
          </div>
          <button
            type="submit"
            className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-xl text-sm w-full px-5 py-2.5 text-center transition duration-300"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
