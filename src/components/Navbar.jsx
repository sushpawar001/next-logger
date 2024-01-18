"use client"
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";


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
        <header className={`flex w-full items-center bg-cyan-600 dark:bg-dark`}>
            <div className="container">
                <div className="relative -mx-4 flex items-center justify-between">
                    <div className="w-60 max-w-full px-4 py-3">
                        <Link href='/'><h1 className="text-3xl font-medium text-white">FitDose</h1></Link>
                    </div>
                    <div className="flex w-full items-center justify-end">
                        <div>
                            <button
                                onClick={() => setOpen(!open)}
                                id="navbarToggler"
                                className={` ${open && "navbarTogglerActive"
                                    } absolute right-4 top-1/2 block -translate-y-1/2 px-3 py-[6px] ring-cyan-700 focus:ring-2 lg:hidden`}
                            >
                                <span className="relative my-[6px] block h-[2px] w-[30px] bg-white"></span>
                                <span className="relative my-[6px] block h-[2px] w-[30px] bg-white"></span>
                                <span className="relative my-[6px] block h-[2px] w-[30px] bg-white"></span>
                            </button>
                            <nav
                                // :className="!navbarOpen && 'hidden' "
                                id="navbarCollapse"
                                className={`absolute right-4 top-full w-full max-w-[250px] bg-cyan-600 lg:bg-cyan-600 px-6 py-3 shadow-xl dark:bg-dark-2 lg:static lg:block lg:w-full lg:max-w-full lg:shadow-none lg:dark:bg-transparent ${!open && "hidden"
                                    } `}
                            >
                                {token ? <ul className="block lg:flex">
                                    <ListItem NavLink="/">Home</ListItem>
                                    <ListItem NavLink="/glucose">Glucose</ListItem>
                                    <ListItem NavLink="/insulin">Insulin</ListItem>
                                    <ListItem NavLink="/weight">Weight</ListItem>
                                    <button className="rounded-md lg:ml-8 bg-white px-5 py-2 mt-2 lg:mt-0 text-md font-medium text-cyan-600 hover:text-cyan-800 transition ease-in-out duration-200 hover:shadow-xl w-full"
                                        onClick={logOut}>Log Out</button>
                                </ul> :
                                    <div className="block lg:flex"><button className="rounded-md lg:ml-8 bg-white px-5 py-2 mt-2 lg:mt-0 text-md font-medium text-cyan-600 hover:text-cyan-800 transition ease-in-out duration-200 hover:shadow-xl w-full"
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
    return (
        <>
            <li>
                <Link
                    href={NavLink}
                    className="flex py-2 text-base font-medium text-white lg:ml-8 lg:inline-flex hover:underline underline-offset-8"
                >
                    {children}
                </Link>
            </li>
        </>
    );
};
