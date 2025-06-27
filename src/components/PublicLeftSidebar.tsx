"use client";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    Activity,
    Home,
    User,
    Target,
    Scale,
    Heart,
    Zap,
    Droplets,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    {
        title: "Home",
        url: "/",
        icon: Home,
        isActive: true,
    },
    {
        title: "Profile",
        url: "/profile",
        icon: User,
    },
    {
        title: "Ideal Weight",
        url: "/tools/ideal-weight-calculator",
        icon: Target,
    },
    {
        title: "BMI Calculator",
        url: "/tools/bmi-calculator",
        icon: Scale,
    },
    {
        title: "WHR Calculator",
        url: "/tools/whr-calculator",
        icon: Heart,
    },
    {
        title: "BMR Calculator",
        url: "/tools/bmr-calculator",
        icon: Zap,
    },
    {
        title: "Water Intake",
        url: "/tools/water-intake-calculator",
        icon: Droplets,
    },
];

export default function PublicLeftSidebar() {
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
        </Sidebar>
    );
}
