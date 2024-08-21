"use client";
import Link from "next/link";
import React from "react";

export default function Dashboard() {
    
    return (
        <div className="h-screen flex flex-col gap-2 justify-center items-center bg-background py-5 px-5 md:px-20">
            <h1 className="text-3xl">HomePage</h1>
            <Link href="/dashboard"><p>Dashboard</p></Link>
        </div>
    );
}
