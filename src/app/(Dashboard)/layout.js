import getToken from "@/helpers/getToken";
import Navbar2 from "@/components/Navbar2";

export const metadata = {
    title: "FitDose",
    description: "Your daily logger!",
};

export default function RootLayout({ children }) {
    const token = getToken();
    return <Navbar2 token={token}>{children}</Navbar2>;
}
