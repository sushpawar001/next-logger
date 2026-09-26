"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import {
    ArrowRight,
    Bolt,
    ChartColumn,
    Dumbbell,
    Droplets,
    House,
    Ruler,
    Settings,
    Smartphone,
    Syringe,
    TrendingUp,
    User,
    Weight,
} from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { useSubscription } from "@/hooks/queries/useReferenceData";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import Logo from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const TRIAL_DAYS = 30;

const navGroups = [
    {
        label: "Overview",
        items: [
            { title: "Home", url: "/dashboard", icon: House },
            { title: "Charts", url: "/charts", icon: TrendingUp },
            { title: "Stats", url: "/stats", icon: ChartColumn },
        ],
    },
    {
        label: "Log",
        items: [
            { title: "Glucose", url: "/glucose", icon: Droplets },
            { title: "Insulin", url: "/insulin", icon: Syringe },
            { title: "Weight", url: "/weight", icon: Weight },
            { title: "Measurement", url: "/measurement", icon: Ruler },
        ],
    },
    {
        label: "More",
        items: [
            { title: "Profile", url: "/profile", icon: User },
            { title: "Plate calculator", url: "/load", icon: Dumbbell },
            { title: "Tools", url: "/tools", icon: Bolt },
        ],
    },
];

/** Active on the page itself and on its `[entryId]` edit pages. */
const isActiveRoute = (pathname: string | null, url: string) =>
    pathname === url || !!pathname?.startsWith(`${url}/`);

// Oat pill with an Aubergine edge for the current page.
const navButton =
    "relative h-10 gap-3 rounded-lg px-4 text-[15px] font-medium text-brand-ink hover:bg-brand-cream hover:text-brand-ink data-[active=true]:bg-brand-oat data-[active=true]:font-semibold data-[active=true]:text-brand-aubergine data-[active=true]:before:absolute data-[active=true]:before:top-2.5 data-[active=true]:before:bottom-2.5 data-[active=true]:before:left-0 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-sm data-[active=true]:before:bg-brand-aubergine [&>svg]:size-5";

function TrialCard() {
    const { data } = useSubscription();
    if (!data || data.subscriptionPlan === "premium") return null;

    const left = Math.max(0, data.remainingDays ?? 0);
    const used = Math.min(TRIAL_DAYS, TRIAL_DAYS - left);
    const ended = left === 0;

    return (
        <div className="mb-4 rounded-xl bg-brand-oat p-4 text-[13px] text-brand-ink">
            <div className="mb-2 flex justify-between">
                <strong className="text-sm">
                    {ended ? "Trial ended" : "Free trial"}
                </strong>
                {!ended && (
                    <span>
                        {left} {left === 1 ? "day" : "days"} left
                    </span>
                )}
            </div>
            <div
                className="h-1.5 overflow-hidden rounded-[3px] bg-white"
                role="progressbar"
                aria-label="Trial used"
                aria-valuemin={0}
                aria-valuemax={TRIAL_DAYS}
                aria-valuenow={used}
            >
                <span
                    className="block h-full rounded-[3px] bg-brand-aubergine"
                    style={{ width: `${(used / TRIAL_DAYS) * 100}%` }}
                />
            </div>
            <Link
                href="/profile"
                className="mt-3.5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-aubergine no-underline"
            >
                See plans <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
        </div>
    );
}

function UserRow() {
    const { user } = useUser();
    const { data } = useSubscription();
    const plan =
        data?.subscriptionPlan === "premium"
            ? "Premium"
            : data && data.remainingDays > 0
              ? "Free trial"
              : "Free";

    return (
        <div className="flex items-center gap-3 border-t border-border px-2 pt-4">
            <Show when="signed-out">
                <SignInButton />
            </Show>
            <Show when="signed-in">
                <UserButton />
                <span className="min-w-0 flex-1 leading-[1.3]">
                    <strong className="block truncate text-sm">
                        {user?.fullName || user?.firstName || "Your account"}
                    </strong>
                    <span className="text-xs text-brand-muted">{plan}</span>
                </span>
            </Show>
            <Link
                href="/profile"
                aria-label="Settings"
                className="inline-grid h-10 w-10 flex-none place-items-center rounded-lg text-brand-muted hover:bg-brand-cream hover:text-brand-ink"
            >
                <Settings className="h-5 w-5" aria-hidden="true" />
            </Link>
        </div>
    );
}

export default function LeftSidebar() {
    const pathname = usePathname();
    const { installed, isSupported } = useInstallPrompt();
    const { isMobile, setOpenMobile } = useSidebar();
    // The mobile drawer stays open across client navigations unless closed.
    const closeDrawer = () => isMobile && setOpenMobile(false);

    return (
        <Sidebar className="border-r border-border">
            <SidebarHeader className="px-7 pt-[30px] pb-0">
                <Link
                    className="flex items-center"
                    href="/dashboard"
                    onClick={closeDrawer}
                >
                    <Logo variant="wordmark" height={28} priority />
                </Link>
            </SidebarHeader>

            <SidebarContent className="mt-8 gap-0 px-2">
                {navGroups.map((group) => (
                    <SidebarGroup key={group.label} className="py-0 pb-5">
                        <SidebarGroupLabel className="h-auto px-3 pb-1.5 text-xs font-semibold uppercase tracking-[0.13em] text-brand-muted">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActiveRoute(pathname, item.url)}
                                            className={navButton}
                                        >
                                            <Link
                                                href={item.url}
                                                onClick={closeDrawer}
                                                aria-current={
                                                    isActiveRoute(pathname, item.url)
                                                        ? "page"
                                                        : undefined
                                                }
                                            >
                                                <item.icon aria-hidden="true" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}

                                {/* Always-available install path, for users who
                                    dismissed the prompt or never triggered it. */}
                                {group.label === "More" &&
                                    !installed &&
                                    isSupported && (
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                onClick={() =>
                                                    window.dispatchEvent(
                                                        new CustomEvent(
                                                            "fitdose:install-requested"
                                                        )
                                                    )
                                                }
                                                className={cn(navButton)}
                                            >
                                                <Smartphone aria-hidden="true" />
                                                <span>Install app</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="px-4 pt-0 pb-4">
                <TrialCard />
                <UserRow />
            </SidebarFooter>
        </Sidebar>
    );
}
