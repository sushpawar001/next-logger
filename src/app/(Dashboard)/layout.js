import getToken from "@/helpers/getToken";
import Navbar2 from "@/components/Navbar2";
import NavbarClerk from "@/components/NavbarClerk";

export const metadata = {
    title: "FitDose",
    description: "Your daily logger!",
};

export default function RootLayout({ children }) {
    const token = getToken();
    return <NavbarClerk token={token}>{children}</NavbarClerk>;
}
