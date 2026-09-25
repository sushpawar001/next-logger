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
    Home,
    User,
    Target,
    Scale,
    Heart,
    Zap,
    Droplets,
} from "lucide-react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
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
        <Sidebar className="border-r border-border">
            <SidebarHeader className="p-6">
                <Link className="flex items-center" href="/dashboard">
                    <Logo variant="wordmark" height={28} priority />
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
                                        className="h-11 rounded-xl hover:bg-accent/50 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground pl-2.5"
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
