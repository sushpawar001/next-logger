export const metadata = {
    title: "FitDose",
    description: "Your daily logger!",
};

export default function RootLayout({ children }) {
    return <div className="h-screen">{children}</div>;
}
