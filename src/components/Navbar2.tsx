"use client";
import {
    HouseIcon,
    GlucoseIcon,
    WeightScaleIcon,
    SyringeIcon,
    ProfileIcon,
} from "@/helpers/iconHelpers";
import { ReactNode, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";

const navPages = {
    Home: "/",
    Programs: "/programs",
    About: "/about",
    "Contact Us": "/contact",
    Login: "https://learn.educodeindia.com/dashboard",
    // Test: "/test",
};

export default function Navbar2({
    children,
    token,
}: {
    children: ReactNode;
    token: string;
}) {
    const router = useRouter();
    const drawerRef = useRef<HTMLInputElement>(null);
    const toggleDrawer = () => {
        if (drawerRef.current) {
            drawerRef.current.click();
        }
    };

    const logOut = async () => {
        try {
            const response = await axios.get("/api/users/logout/");
            console.log("logout: ", response);
            router.refresh();
        } catch (error) {
            console.log(error);
        }
    };
    const logIn = () => {
        router.push("/login");
    };

    return (
        <>
            <div className="drawer">
                <input
                    id="my-drawer-3"
                    type="checkbox"
                    className="drawer-toggle"
                    ref={drawerRef}
                />
                <div className="drawer-content flex flex-col w-full h-screen">
                    {/* Navbar */}
                    <div className="w-full bg-secondary text-white p-0">
                        <div className="container">
                            <div className="flex lg:gap-16 my-3 w-full items-center lg:justify-center justify-between">
                                {/* logo */}
                                <div className="flex-none lg:hidden">
                                    <label
                                        htmlFor="my-drawer-3"
                                        aria-label="open sidebar"
                                        className="btn btn-square btn-ghost"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M4 6h16M4 12h8m-8 6h16"
                                            />
                                        </svg>
                                    </label>
                                </div>
                                {/* <div className="order-2 lg:order-1"> */}
                                <div className="text-center w-full lg:w-auto">
                                    <Link href="/">
                                        <h1 className="text-2xl md:text-3xl font-medium text-white">
                                            FitDose
                                        </h1>
                                    </Link>
                                </div>

                                {/* primary */}
                                <div className="hidden lg:flex gap-8 font-redhat font-semibold lg:flex-grow lg:justify-end lg:order-2">
                                    {token ? (
                                        <ul className="block lg:flex">
                                            <ListItem
                                                NavLink="/"
                                                icon={<HouseIcon />}
                                            >
                                                <p className="my-auto">Home</p>
                                            </ListItem>
                                            <ListItem
                                                NavLink="/profile"
                                                icon={<ProfileIcon />}
                                            >
                                                <p className="my-auto">
                                                    Profile
                                                </p>
                                            </ListItem>
                                            <ListItem
                                                NavLink="/glucose"
                                                icon={<GlucoseIcon />}
                                            >
                                                <p className="my-auto">
                                                    Glucose
                                                </p>
                                            </ListItem>
                                            <ListItem
                                                NavLink="/insulin"
                                                icon={<SyringeIcon />}
                                            >
                                                <p className="my-auto">
                                                    Insulin
                                                </p>
                                            </ListItem>
                                            <ListItem
                                                NavLink="/weight"
                                                icon={<WeightScaleIcon />}
                                            >
                                                <p className="my-auto">
                                                    Weight
                                                </p>
                                            </ListItem>
                                            <button
                                                className="rounded-xl lg:ml-6 outline outline-1 outline-white px-5 my-2 lg:my-auto py-2 text-base font-medium text-white transition ease-in-out duration-500 w-full hover:scale-105 hover:bg-primary hover:outline-primary-dark"
                                                onClick={logOut}
                                            >
                                                Log Out
                                            </button>
                                        </ul>
                                    ) : (
                                        <div className="block lg:flex">
                                            <button
                                                className="rounded-xl lg:ml-6 outline outline-1 outline-white px-5 my-2 lg:my-auto py-2 text-base font-medium text-white transition ease-in-out duration-500 h-full w-full hover:scale-105 hover:bg-primary hover:outline-primary-dark"
                                                onClick={logIn}
                                            >
                                                Log in
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">{children}</div>
                </div>
                <div className="drawer-side">
                    <label
                        htmlFor="my-drawer-3"
                        aria-label="close sidebar"
                        className="drawer-overlay"
                    ></label>
                    <ul className="menu p-4 w-80 min-h-full bg-secondary text-white">
                        <ListItem NavLink="/" icon={<HouseIcon />}>
                            <p className="my-auto" onClick={toggleDrawer}>
                                Home
                            </p>
                        </ListItem>
                        <ListItem NavLink="/profile" icon={<ProfileIcon />}>
                            <p className="my-auto" onClick={toggleDrawer}>
                                Profile
                            </p>
                        </ListItem>
                        <ListItem NavLink="/glucose" icon={<GlucoseIcon />}>
                            <p className="my-auto" onClick={toggleDrawer}>
                                Glucose
                            </p>
                        </ListItem>
                        <ListItem NavLink="/insulin" icon={<SyringeIcon />}>
                            <p className="my-auto" onClick={toggleDrawer}>
                                Insulin
                            </p>
                        </ListItem>
                        <ListItem NavLink="/weight" icon={<WeightScaleIcon />}>
                            <p className="my-auto" onClick={toggleDrawer}>
                                Weight
                            </p>
                        </ListItem>
                    </ul>
                </div>
            </div>
        </>
    );
}

const ListItem = ({ children, NavLink, icon }) => {
    const currentRoute = usePathname();
    const nonActiveStyle =
        "text-right flex py-2 text-base font-medium text-white lg:ml-6 lg:inline-flex hover:underline underline-offset-8 group";
    const activeStyle =
        "underline text-right flex py-2 text-base font-medium text-white lg:ml-6 lg:inline-flex hover:underline underline-offset-8";
    const activeIcon =
        "bg-primary flex size-8 items-center justify-center my-auto mr-4 lg:mr-2 rounded-lg";
    const nonActiveIcon =
        "bg-grayNav flex size-8 items-center justify-center my-auto mr-4 lg:mr-2 rounded-lg group-hover:scale-[1.15] transition-transform duration-300 ease-in-out";
    return (
        <>
            <li>
                <Link
                    href={NavLink}
                    className={
                        currentRoute === NavLink ? activeStyle : nonActiveStyle
                    }
                >
                    <div
                        className={
                            currentRoute === NavLink
                                ? activeIcon
                                : nonActiveIcon
                        }
                    >
                        {icon}
                    </div>
                    {children}
                </Link>
            </li>
        </>
    );
};
