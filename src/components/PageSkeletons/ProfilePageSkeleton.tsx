import { Skeleton, SVGSkeleton } from "./SkeletonBase";

const ProfilePageSkeleton = () => (
    <>
        <main className="w-full h-full">
            <div className="h-full py-5 px-5">
                <div className="flex flex-col max-w-screen-lg mx-auto justify-center h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="border shadow-sm  col-span-1 md:col-span-2 rounded-lg">
                            <div className="flex flex-col space-y-1.5 p-6 pb-4">
                                <div className="tracking-tight flex items-center gap-3">
                                    <Skeleton className="w-[152px] max-w-full" />
                                    <div className="p-2 from-blue-500">
                                        <SVGSkeleton className="w-[24px] h-[24px]" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 pt-0 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div className="inline-flex items-center border px-2.5 py-0.5 transition-colors  w-fit rounded-lg">
                                        <Skeleton className="w-[80px] max-w-full" />
                                    </div>
                                </div>
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 border  rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <SVGSkeleton className="flex-shrink-0 w-[24px] h-[24px]" />
                                        <div>
                                            <div>
                                                <Skeleton className="w-[64px] max-w-full" />
                                            </div>
                                            <div>
                                                <Skeleton className="w-[72px] max-w-full" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-left lg:text-right">
                                        <div>
                                            <Skeleton className="w-[80px] max-w-full" />
                                        </div>
                                        <div>
                                            <Skeleton className="w-[120px] max-w-full" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-stretch sm:justify-end">
                                    <div className="inline-flex items-center justify-center gap-2 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 h-10 w-full sm:w-auto from-[#5E4AE3] hover:from-[#5E4AE3]/90 py-2.5 px-8 hover:shadow-lg">
                                        <SVGSkeleton className="lucide-crown mr-2 w-[24px] h-[24px]" />
                                        <span>
                                            <Skeleton className="w-[144px] max-w-full" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 md:p-7 border  col-span-1 rounded-lg">
                            <div className="flex items-center gap-3 mb-4 md:mb-6">
                                <div className="p-2 from-green-500">
                                    <SVGSkeleton className="w-[24px] h-[24px]" />
                                </div>
                                <div>
                                    <h2>
                                        <Skeleton className="w-[104px] max-w-full" />
                                    </h2>
                                    {/* <p> */}
                                        <Skeleton className="w-[392px] max-w-full" />
                                    {/* </p> */}
                                </div>
                            </div>
                            <form className="flex flex-col md:flex-row gap-2 mb-4">
                                <div className="border block w-full px-2.5 py-2 h-10 rounded-lg"></div>
                                <div className="min-w-fit w-full md:w-1/5 py-2.5">
                                    <Skeleton className="w-[32px] max-w-full" />
                                </div>
                            </form>
                            <div className="flex flex-wrap gap-1">
                                <div className="py-0.5 px-1.5 md:px-2.5 flex items-center justify-center gap-1 w-fit">
                                    {/* <p> */}
                                        <Skeleton className="w-[64px] max-w-full" />
                                    {/* </p> */}
                                    <div className="p-1">
                                        <Skeleton className="w-[14px] max-w-full" />
                                    </div>
                                </div>
                                <div className="py-0.5 px-1.5 md:px-2.5 flex items-center justify-center gap-1 w-fit">
                                    {/* <p> */}
                                        <Skeleton className="w-[48px] max-w-full" />
                                    {/* </p> */}
                                    <div className="p-1">
                                        <Skeleton className="w-[14px] max-w-full" />
                                    </div>
                                </div>
                                <div className="py-0.5 px-1.5 md:px-2.5 flex items-center justify-center gap-1 w-fit">
                                    {/* <p> */}
                                        <Skeleton className="w-[48px] max-w-full" />
                                    {/* </p> */}
                                    <div className="p-1">
                                        <Skeleton className="w-[14px] max-w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 md:p-7 border  col-span-1 rounded-lg">
                            <div className="flex items-center gap-3 mb-4 md:mb-6">
                                <div className="p-2 from-green-500">
                                    <SVGSkeleton className="w-[24px] h-[24px]" />
                                </div>
                                <div>
                                    <h2>
                                        <Skeleton className="w-[120px] max-w-full" />
                                    </h2>
                                    {/* <p> */}
                                        <Skeleton className="w-[280px] max-w-full" />
                                    {/* </p> */}
                                </div>
                            </div>
                            <form className="flex flex-col md:flex-row gap-2">
                                <div className="border block w-full px-2.5 py-2  h-10 rounded-lg">
                                    <Skeleton className="w-[176px] max-w-full" />
                                </div>
                                <div className="w-full lg:w-1/5 py-2.5">
                                    <Skeleton className="w-[24px] max-w-full" />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </>
);

export default ProfilePageSkeleton;
