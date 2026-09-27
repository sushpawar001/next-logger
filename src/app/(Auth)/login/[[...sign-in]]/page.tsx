import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";

export default function LogInPage() {
    return (
        <AuthShell>
            <SignIn />
        </AuthShell>
    );
}
