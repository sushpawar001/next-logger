"use client";
import { useRef } from "react";
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
    TrendingUp,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";

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
        title: "Charts",
        url: "/charts",
        icon: TrendingUp,
        key: "charts",
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
    const currentRoute = usePathname();

    return (
        <Sidebar className="border-r border-purple-100">
            <SidebarHeader className="p-6">
                <Link className="flex items-center gap-3" href="/dashboard">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED] text-white">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            FitDose
                        </h1>
                    </div>
                </Link>
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
