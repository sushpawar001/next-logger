import getToken from "@/helpers/getToken";
import Navbar2 from "@/components/Navbar2";
import NavbarClerk from "@/components/NavbarClerk";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
    title: "FitDose",
    description: "Your daily logger!",
};

export default function RootLayout({ children }) {
    const token = getToken();
    return (
        <ClerkProvider>
            <NavbarClerk >{children}</NavbarClerk>
        </ClerkProvider>
    );
}
