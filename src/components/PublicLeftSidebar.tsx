"use client";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, LayoutGrid, User } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";
import { toolsByCluster } from "@/lib/tools/registry";

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
        title: "All tools",
        url: "/tools",
        icon: LayoutGrid,
    },
];

const toolGroups = toolsByCluster().map((cluster) => ({
    label: cluster.label,
    items: cluster.tools.map((tool) => ({
        title: tool.shortName,
        url: tool.href,
        icon: tool.icon,
    })),
}));

const itemClass =
    "h-11 rounded-xl hover:bg-accent/50 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground pl-2.5";

function MenuLinks({
    items,
    currentRoute,
}: {
    items: { title: string; url: string; icon: ElementType }[];
    currentRoute: string;
}) {
    return (
        <SidebarMenu className="space-y-1">
            {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                        asChild
                        isActive={currentRoute === item.url}
                        className={itemClass}
                    >
                        <a href={item.url} className="flex items-center gap-3">
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.title}</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}

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
                    <SidebarGroupContent>
                        <MenuLinks items={menuItems} currentRoute={currentRoute} />
                    </SidebarGroupContent>
                </SidebarGroup>
                {toolGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel className="text-gray-600 font-medium">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <MenuLinks
                                items={group.items}
                                currentRoute={currentRoute}
                            />
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </Sidebar>
    );
}
