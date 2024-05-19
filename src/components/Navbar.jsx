"use client";
import {
    HouseIcon,
    GlucoseIcon,
    WeightScaleIcon,
    SyringeIcon,
    ProfileIcon,
} from "@/helpers/iconHelpers";
import axios from "axios";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

const Navbar = ({ token }) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const trigger = useRef(null);
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

    // close on click outside
    useEffect(() => {
        const clickHandler = ({ target }) => {
            if (!open || trigger.current.contains(target)) return;
            setTimeout(() => {
                setOpen(false);
            }, 100);
        };
        document.addEventListener("click", clickHandler);
        return () => document.removeEventListener("click", clickHandler);
    });

    return (
        <header className="flex w-full items-center bg-secondary py-2 md:py-0">
            <div className="container">
                <div className="relative -mx-4 lg:-mx-6 flex items-center justify-between">
                    <div className="w-60 max-w-full px-4 py-1">
                        <Link href="/">
                            <h1 className="text-2xl md:text-3xl font-medium text-white">
                                FitDose
                            </h1>
                        </Link>
                    </div>
                    <div className="flex w-full items-center justify-end">
                        <div>
                            <button
                                onClick={() => setOpen(!open)}
                                ref={trigger}
                                id="navbarToggler"
                                className={` ${
                                    open && "navbarTogglerActive"
                                } absolute right-4 top-1/2 block -translate-y-1/2 px-3 py-[6px] ring-primary-ring focus:ring-2 lg:hidden`}
                            >
                                <span className="relative my-[6px] block h-[2px] w-[30px] bg-white"></span>
                                <span className="relative my-[6px] block h-[2px] w-[30px] bg-white"></span>
                                <span className="relative my-[6px] block h-[2px] w-[30px] bg-white"></span>
                            </button>
                            <nav
                                // :className="!navbarOpen && 'hidden' "
                                id="navbarCollapse"
                                className={`rounded absolute border border-primary-ring shadow-primary-ring right-4 top-full w-full max-w-[250px] bg-secondary lg:bg-transparent px-6 py-2 shadow lg:static lg:block lg:w-full lg:max-w-full lg:border-0 lg:shadow-none ${
                                    !open && "hidden"
                                } `}
                            >
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
                                            <p className="my-auto">Profile</p>
                                        </ListItem>
                                        <ListItem
                                            NavLink="/glucose"
                                            icon={<GlucoseIcon />}
                                        >
                                            <p className="my-auto">Glucose</p>
                                        </ListItem>
                                        <ListItem
                                            NavLink="/insulin"
                                            icon={<SyringeIcon />}
                                        >
                                            <p className="my-auto">Insulin</p>
                                        </ListItem>
                                        <ListItem
                                            NavLink="/weight"
                                            icon={<WeightScaleIcon />}
                                        >
                                            <p className="my-auto">Weight</p>
                                        </ListItem>
                                        <button
                                            className="rounded-xl lg:ml-6 outline outline-1 outline-white px-5 my-2 lg:my-auto py-2 text-base font-medium text-white transition ease-in-out duration-500 h-full w-full hover:scale-105 hover:bg-primary hover:outline-primary-dark"
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
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;

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
