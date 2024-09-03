import { ClerkProvider } from "@clerk/nextjs";
export const metadata = {
    title: "FitDose",
    description: "Your daily logger!",
};

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
            <div className="h-screen">{children}</div>
        </ClerkProvider>
    );
}
