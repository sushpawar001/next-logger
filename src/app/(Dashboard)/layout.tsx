import getToken from "@/helpers/getToken";
import Navbar2 from "@/components/Navbar2";
import NavbarClerk from "@/components/NavbarClerk";
import { ClerkProvider } from "@clerk/nextjs";
import LeftSidebar from "@/components/LeftSidebar";
import {
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
} from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
export const metadata = {
    title: "FitDose",
    description: "Your daily logger!",
};

export default function RootLayout({ children }) {
    const token = getToken();
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
            <SidebarProvider>
                <LeftSidebar />
                <SidebarInset>
                    <DashboardHeader />
                    {/* <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 ">
                        <SidebarTrigger className="-ml-1" />
                        <div className="h-4 w-px bg-sidebar-border" />
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-sidebar-foreground">
                                Dashboard
                            </h2>
                        </div>
                    </header>
                </SidebarInset> */}
                    <main className="w-full h-full">{children}</main>
                </SidebarInset>
            </SidebarProvider>
        </ClerkProvider>
    );
}
