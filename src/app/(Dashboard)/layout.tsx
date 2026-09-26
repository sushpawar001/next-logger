import getToken from "@/helpers/getToken";
import { ClerkProvider } from "@clerk/nextjs";
import LeftSidebar from "@/components/LeftSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import InstallAppCard from "@/components/pwa/InstallAppCard";
import QueryProvider from "@/components/providers/QueryProvider";
export const metadata = {
    title: "FitDose",
    description: "Your daily logger!",
};

export default async function RootLayout({ children }) {
    const token = await getToken();
    return (
        <ClerkProvider
            appearance={{
                elements: {
                    userButtonPopoverRootBox: {
                        width: "100%",
                        pointerEvents: "auto",
                    },
                },
            }}
        >
            <QueryProvider>
                <SidebarProvider>
                    <LeftSidebar />
                    <SidebarInset>
                        <DashboardHeader />
                        {/* SidebarInset is the <main>; pages lay out inside this column,
                            filling the space beside the sidebar (capped for ultra-wide screens). */}
                        <div className="mx-auto w-full max-w-[1920px] px-4 pt-5 pb-10 lg:px-10 lg:pt-10 lg:pb-14">
                            {children}
                        </div>
                        {/* Dashboard only — never on the public /tools calculators. */}
                        <InstallAppCard />
                    </SidebarInset>
                </SidebarProvider>
            </QueryProvider>
        </ClerkProvider>
    );
}
