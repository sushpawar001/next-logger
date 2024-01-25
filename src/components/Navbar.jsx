"use client"
import { HouseIcon, GlucoseIcon, WeightScaleIcon, SyringeIcon } from "@/helpers/iconHelpers";
import axios from "axios";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useState } from "react";

const Navbar = ({ token }) => {
    const router = useRouter()
    const [open, setOpen] = useState(false);
    const logOut = async () => {
        try {
            const response = await axios.get('/api/users/logout/')
            console.log(response)
            // router.push('/login')
            router.refresh()
        } catch (error) {
            console.log(error)
        }
    }
    const logIn = () => { router.push('/login') }


    return (
        <header className='flex w-full items-center bg-secondary py-2 md:py-0'>
            <div className="container">
                <div className="relative -mx-4 flex items-center justify-between">
                    <div className="w-60 max-w-full px-4 py-1">
                        <Link href='/'><h1 className="text-2xl md:text-3xl font-medium text-white">FitDose</h1></Link>
                    </div>
                    <div className="flex w-full items-center justify-end">
                        <div>
                            <button
                                onClick={() => setOpen(!open)}
                                id="navbarToggler"
                                className={` ${open && "navbarTogglerActive"
                                    } absolute right-4 top-1/2 block -translate-y-1/2 px-3 py-[6px] ring-primary-ring focus:ring-2 lg:hidden`}
                            >
                                <span className="relative my-[6px] block h-[2px] w-[30px] bg-white"></span>
                                <span className="relative my-[6px] block h-[2px] w-[30px] bg-white"></span>
                                <span className="relative my-[6px] block h-[2px] w-[30px] bg-white"></span>
                            </button>
                            <nav
                                // :className="!navbarOpen && 'hidden' "
                                id="navbarCollapse"
                                className={`rounded absolute right-4 top-full w-full max-w-[250px] bg-background lg:bg-transparent px-6 py-3 shadow-xl lg:static lg:block lg:w-full lg:max-w-full lg:shadow-none ${!open && "hidden"
                                    } `}
                            >
                                {token ? <ul className="block lg:flex">
                                    <ListItem NavLink="/"><HouseIcon className='my-auto mr-2' />Home</ListItem>
                                    <ListItem NavLink="/glucose"><GlucoseIcon className='my-auto mr-2' />Glucose</ListItem>
                                    <ListItem NavLink="/insulin"><SyringeIcon className='my-auto mr-2' />Insulin</ListItem>
                                    <ListItem NavLink="/weight"><WeightScaleIcon className='my-auto mr-2' />Weight</ListItem>
                                    <button className="rounded-xl lg:ml-8 outline outline-1 outline-white px-5 py-2 mt-2 lg:mt-0 text-base font-medium text-white transition ease-in-out duration-200 w-full"
                                        onClick={logOut}>Log Out</button>
                                </ul> :
                                    <div className="block lg:flex"><button className="rounded-xl lg:ml-8 outline outline-1 outline-white px-5 py-2 mt-2 lg:mt-0 text-base font-medium text-white transition ease-in-out duration-200 w-full"
                                        onClick={logIn}>Log in</button></div>
                                }
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );

};

export default Navbar;

const ListItem = ({ children, NavLink }) => {
    const currentRoute = usePathname();
    const nonActiveStyle = "text-right flex py-2 text-base font-medium text-white lg:ml-6 lg:inline-flex hover:underline underline-offset-8"
    const activeStyle = "underline text-right flex py-2 text-base font-medium text-white lg:ml-6 lg:inline-flex hover:underline underline-offset-8"
    return (
        <>
            <li>
                <Link
                    href={NavLink}
                    className={currentRoute === NavLink ? activeStyle : nonActiveStyle}
                >
                    {children}
                </Link>
            </li>
        </>
    );
};
