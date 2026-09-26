/** Placeholder in the shape of the profile page while its three queries load. */
const Bar = ({ className }: { className: string }) => (
    <div className={`animate-pulse rounded-md bg-brand-oat ${className}`} />
);

const Card = ({ children, oat = false }: { children: React.ReactNode; oat?: boolean }) => (
    <div
        className={`rounded-2xl border p-5 lg:p-6 ${
            oat ? "border-brand-oat bg-brand-oat" : "border-border bg-white"
        }`}
    >
        {children}
    </div>
);

const ProfilePageSkeleton = () => (
    <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading profile…</span>
        <div className="mb-4 lg:mb-6">
            <Bar className="h-8 w-40" />
            <Bar className="mt-2 h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
            <div className="flex flex-col gap-4 lg:col-span-8 lg:gap-5">
                <Card>
                    <div className="flex items-center gap-5">
                        <Bar className="h-20 w-20 rounded-full!" />
                        <div className="flex-1">
                            <Bar className="h-6 w-48" />
                            <Bar className="mt-2 h-4 w-56" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <Bar className="h-5 w-32" />
                    <div className="mt-5 flex gap-2">
                        <Bar className="h-10 w-28 rounded-[20px]!" />
                        <Bar className="h-10 w-24 rounded-[20px]!" />
                    </div>
                    <Bar className="mt-5 h-11 w-full" />
                </Card>
            </div>
            <div className="flex flex-col gap-4 lg:col-span-4 lg:gap-5">
                <Card>
                    <Bar className="h-4 w-20" />
                    <Bar className="mt-3 h-7 w-32" />
                    <Bar className="mt-4 h-11 w-full" />
                </Card>
                <Card>
                    <Bar className="h-5 w-28" />
                    <Bar className="mt-5 h-24 w-full" />
                </Card>
            </div>
        </div>
    </div>
);

export default ProfilePageSkeleton;
