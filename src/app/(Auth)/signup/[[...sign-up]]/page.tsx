import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";

export default function SignUpPage() {
    return (
        <AuthShell>
            <SignUp />
        </AuthShell>
    );
}
