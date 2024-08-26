"use client";
import React from "react";
// import { motion } from "framer-motion";
import dynamic from "next/dynamic";
const MotionDiv = dynamic(
    () => import("framer-motion").then((mod) => mod.motion.div),
    {
        ssr: false,
    }
);

export default function AnimatedCard({
    icon,
    heading,
    description,
}: {
    icon: JSX.Element;
    heading: string;
    description: string;
}) {
    return (
        <MotionDiv
            className="bg-white py-5 px-7 drop-shadow-md rounded-lg"
            initial={{ translateY: 100 }}
            whileInView={{ translateY: 0 }}
            viewport={{ once: true }}
            transition={{
                ease: "easeInOut",
                delay: 0.2,
                type: "spring",
            }}
        >
            <div className="bg-primary text-white p-3 text-xl w-fit rounded-full">
                {icon}
            </div>
            <h3 className="text-lg lg:text-2xl font-bold py-4">{heading}</h3>
            <p>{description}</p>
        </MotionDiv>
    );
}
