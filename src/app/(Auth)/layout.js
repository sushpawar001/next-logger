import { ClerkProvider } from "@clerk/nextjs";
import { authAppearance, authLocalization } from "@/components/auth/clerkTheme";
export const metadata = {
    title: "FitDose",
    description: "Your daily logger!",
};

export default function RootLayout({ children }) {
    return (
        <ClerkProvider appearance={authAppearance} localization={authLocalization}>
            <div className="h-screen">{children}</div>
        </ClerkProvider>
    );
}
