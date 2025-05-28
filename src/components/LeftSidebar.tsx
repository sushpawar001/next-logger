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
import {
    Home,
    User,
    BarChart3,
    Droplets,
    Syringe,
    Weight,
    Ruler,
    Activity,
    Settings,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
    {
        title: "Home",
        url: "/dashboard",
        icon: Home,
        isActive: true,
    },
    {
        title: "Profile",
        url: "/profile",
        icon: User,
    },
    {
        title: "Stats",
        url: "/stats",
        icon: BarChart3,
    },
    {
        title: "Glucose",
        url: "/glucose",
        icon: Droplets,
    },
    {
        title: "Insulin",
        url: "/insulin",
        icon: Syringe,
    },
    {
        title: "Weight",
        url: "/weight",
        icon: Weight,
    },
    {
        title: "Measurement",
        url: "/measurement",
        icon: Ruler,
    },
];

export default function LeftSidebar() {
    // export default function LeftNavbar({ children }: { children: ReactNode }) {
    const drawerRef = useRef<HTMLInputElement>(null);
    const toggleDrawer = () => {
        if (drawerRef.current) {
            drawerRef.current.click();
        }
    };
    const currentRoute = usePathname();

    return (
        <Sidebar className="border-r border-purple-100">
            <SidebarHeader className="p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED] text-white">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            FitDose
                        </h1>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-4 mt-8">
                <SidebarGroup>
                    {/* <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
                        Dashboard
                    </SidebarGroupLabel> */}
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={currentRoute === item.url}
                                        className="h-11 rounded-xl hover:bg-purple-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#5E4AE3] data-[active=true]:to-[#7C3AED] data-[active=true]:text-white pl-2.5"
                                    >
                                        <a
                                            href={item.url}
                                            className="flex items-center gap-3"
                                        >
                                            <item.icon className="h-5 w-5" />
                                            <span className="font-medium">
                                                {item.title}
                                            </span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="h-12 rounded-xl hover:bg-purple-50">
                            <div className="flex items-center gap-3 w-full">
                                {/* <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                    <AvatarFallback className="bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED] text-white text-sm">
                                        JD
                                    </AvatarFallback>
                                </Avatar> */}
                                <div className="flex-1 text-left">
                                    <SignedOut>
                                        <SignInButton />
                                    </SignedOut>
                                    <SignedIn>
                                        <UserButton
                                            showName={true}
                                            appearance={{
                                                elements: {
                                                    userButtonBox: {
                                                        flexDirection:
                                                            "row-reverse",
                                                    },
                                                },
                                            }}
                                        />
                                    </SignedIn>
                                </div>

                                <Settings className="h-4 w-4 text-gray-400" />
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
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
