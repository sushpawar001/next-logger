import { DashboardHeader } from "@/components/DashboardHeader";
import PublicLeftSidebar from "@/components/PublicLeftSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
    title: "FitDose",
    description: "Your daily logger!",
};

export default function RootLayout({ children }) {
    return (
        // <ClerkProvider
        //     appearance={{
        //         elements: {
        //             userButtonPopoverRootBox: {
        //                 width: "100%",
        //                 pointerEvents: "auto",
        //             },
        //         },
        //     }}
        // >
        // </ClerkProvider>
        <SidebarProvider>
            <PublicLeftSidebar />
            <SidebarInset>
                <DashboardHeader />
                <main className="w-full h-full">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
