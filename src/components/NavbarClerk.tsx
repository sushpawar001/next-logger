"use client";
import {
    HouseIcon,
    GlucoseIcon,
    WeightScaleIcon,
    SyringeIcon,
    ProfileIcon,
    TapeIcon,
    ChartIcon,
    SignUpIcon,
    LoginIcon,
} from "@/helpers/iconHelpers";
import { ReactNode, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function NavbarClerk({ children }: { children: ReactNode }) {
    const drawerRef = useRef<HTMLInputElement>(null);
    const toggleDrawer = () => {
        if (drawerRef.current) {
            drawerRef.current.click();
        }
    };

    return (
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
                        <div className="flex lg:gap-10 my-1 lg:my-3 w-full items-center lg:justify-center justify-between">
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
                                    <h1 className="text-xl xl:text-3xl font-medium text-white">
                                        FitDose
                                    </h1>
                                </Link>
                            </div>

                            {/* primary */}
                            <div className="hidden lg:flex font-redhat font-semibold lg:flex-grow lg:justify-end lg:order-2">
                                <ul className="block lg:flex lg:mr-4 xl:mr-6">
                                    <IconList />
                                    <li className="flex py-2 lg:ml-4 xl:ml-6 lg:inline-flex">
                                        <SignedOut>
                                            <SignInButton />
                                        </SignedOut>
                                        <SignedIn>
                                            <UserButton />
                                        </SignedIn>
                                    </li>
                                </ul>
                            </div>
                            <div className="order-3 lg:hidden min-w-fit"></div>
                        </div>
                    </div>
                </div>
                <div className="flex-1">{children}</div>
            </div>
            {/* mobile menu */}
            <div className="drawer-side lg:hidden">
                <label
                    htmlFor="my-drawer-3"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                ></label>
                <ul className="menu p-2.5 md:p-4 w-3/4 md:w-80 min-h-full bg-secondary text-white">
                    <IconList onClickFn={toggleDrawer} />
                    <li className="flex py-2 lg:ml-4 xl:ml-6 lg:inline-flex mt-auto ">
                        <SignedOut>
                            <SignInButton />
                        </SignedOut>
                        <SignedIn>
                            <UserButton
                                showName={true}
                                appearance={{
                                    elements: {
                                        userButtonBox: {
                                            flexDirection: "row-reverse",
                                            color: "white",
                                        },
                                    },
                                }}
                            />
                        </SignedIn>
                    </li>
                </ul>
            </div>
        </div>
    );
}

const ListItem = ({
    children,
    NavLink,
    icon,
    onClickFn,
}: {
    children: ReactNode;
    NavLink: string;
    icon: ReactNode;
    onClickFn?: VoidFunction;
}) => {
    const currentRoute = usePathname();
    const nonActiveStyle =
        "text-right flex py-2 text-sm xl:text-base font-medium text-white lg:ml-4 xl:ml-6 lg:inline-flex hover:underline underline-offset-8 group";
    const activeStyle =
        "underline text-right flex py-2 text-sm xl:text-base font-medium text-white lg:ml-4 xl:ml-6 lg:inline-flex hover:underline underline-offset-8";
    const activeIcon =
        "bg-primary flex size-7 items-center justify-center my-auto mr-4 lg:mr-2 rounded-lg";
    const nonActiveIcon =
        "bg-grayNav flex size-7 items-center justify-center my-auto mr-4 lg:mr-2 rounded-lg group-hover:scale-[1.15] transition-transform duration-300 ease-in-out";
    return (
        <>
            <li onClick={onClickFn}>
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

const IconList = ({ onClickFn }: { onClickFn?: VoidFunction }) => (
    <>
        <ListItem
            NavLink="/dashboard"
            icon={<HouseIcon />}
            onClickFn={onClickFn}
        >
            <p className="my-auto">Home</p>
        </ListItem>
        <ListItem
            NavLink="/profile"
            icon={<ProfileIcon />}
            onClickFn={onClickFn}
        >
            <p className="my-auto">Profile</p>
        </ListItem>
        <ListItem NavLink="/stats" icon={<ChartIcon />} onClickFn={onClickFn}>
            <p className="my-auto">Stats</p>
        </ListItem>
        <ListItem
            NavLink="/glucose"
            icon={<GlucoseIcon />}
            onClickFn={onClickFn}
        >
            <p className="my-auto">Glucose</p>
        </ListItem>
        <ListItem
            NavLink="/insulin"
            icon={<SyringeIcon />}
            onClickFn={onClickFn}
        >
            <p className="my-auto">Insulin</p>
        </ListItem>
        <ListItem
            NavLink="/weight"
            icon={<WeightScaleIcon />}
            onClickFn={onClickFn}
        >
            <p className="my-auto">Weight</p>
        </ListItem>
        <ListItem
            NavLink="/measurement"
            icon={<TapeIcon />}
            onClickFn={onClickFn}
        >
            <p className="my-auto">Measurement</p>
        </ListItem>
    </>
);
