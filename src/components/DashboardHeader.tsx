import { SidebarTrigger } from "@/components/ui/sidebar";
import { Activity } from "lucide-react";

export function DashboardHeader() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-purple-100 bg-white/80 backdrop-blur-sm px-4 md:hidden">
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED] text-white">
                    <Activity className="h-4 w-4" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">FitDose</h1>
                </div>
            </div>
            <SidebarTrigger />
        </header>
    );
}
