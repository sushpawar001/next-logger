"use client";
import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import { Panel } from "@/components/app-ui/layout";

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]!.toUpperCase())
        .join("");
}

/** Who is signed in. Account settings live in Clerk's menu under the avatar. */
export default function AccountCard({ className }: { className?: string }) {
    const { user } = useUser();
    const name = user?.fullName || user?.firstName || "Your account";
    const email = user?.primaryEmailAddress?.emailAddress;
    const since = user?.createdAt ? dayjs(user.createdAt).format("MMMM YYYY") : null;

    return (
        <Panel aria-label="Account" className={className}>
            <div className="flex flex-wrap items-center gap-5 lg:gap-6">
                {user?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={user.imageUrl}
                        alt=""
                        className="h-20 w-20 flex-none rounded-full object-cover"
                    />
                ) : (
                    <span
                        className="grid h-20 w-20 flex-none place-items-center rounded-full bg-brand-aubergine text-[30px] font-semibold text-brand-cream"
                        aria-hidden="true"
                    >
                        {initials(name) || "?"}
                    </span>
                )}
                <div className="min-w-[200px] flex-1">
                    <h2 className="text-[22px] font-semibold text-brand-ink">{name}</h2>
                    {email && <p className="text-[13px] text-brand-muted">{email}</p>}
                    {since && (
                        <p className="mt-2 text-[13px] text-brand-muted">
                            Member since {since}
                        </p>
                    )}
                </div>
            </div>
        </Panel>
    );
}
