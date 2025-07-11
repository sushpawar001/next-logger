const LoadingSkeleton = () => (
    <>
        <section className="h-full flex justify-center items-center p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
                <div className="p-4 border  shadow-md flex items-center justify-between md:col-span-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 from-[#5E4AE3]">
                            <SVGSkeleton className="w-[24px] h-[24px]" />
                        </div>
                        <div>
                            <h3>
                                <Skeleton className="w-[88px] max-w-full" />
                            </h3>
                                <Skeleton className="w-[240px] max-w-full" />
                        </div>
                    </div>
                    <div className="border block p-2.5 w-32  "></div>
                </div>
                <div className="mb-4 md:mb-6 mx-auto p-3 md:px-6 border  shadow-md h-full w-full md:col-span-2">
                    <h3 className="block p-0 mb-3">
                        <Skeleton className="w-[112px] max-w-full" />
                    </h3>
                    <div className="h-72">
                        <div className="recharts-responsive-container">
                            <div>
                                <div className="recharts-tooltip-wrapper"></div>
                                <SVGSkeleton className="w-[496px] h-[288px]" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <form className="max-w-full mx-auto p-4 md:px-6 py-5 border  h-full shadow-md">
                        <div className="flex items-center gap-3 mb-3">
                            <Skeleton className="w-[104px] max-w-full" />
                            <div className="p-2 from-blue-500">
                                <SVGSkeleton className="w-[24px] h-[24px]" />
                            </div>
                        </div>
                        <div className="flex flex-col space-y-3">
                            <div className="space-y-2">
                                <label>
                                    <Skeleton className="w-[104px] max-w-full" />
                                </label>
                                <div className="border block w-full px-2.5 py-2   h-10">
                                    <Skeleton className="w-[64px] max-w-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label>
                                    <Skeleton className="w-[88px] max-w-full" />
                                </label>
                                <div className="border block w-full px-2.5 py-2   h-10"></div>
                            </div>
                            <div className="space-y-2">
                                <label>
                                    <Skeleton className="w-[120px] max-w-full" />
                                </label>
                                <div className="border   block w-full px-2.5 py-2 h-10"></div>
                            </div>
                            <div className="from-[#5E4AE3] hover:from-[#5E4AE3]/90 w-full py-2">
                                <Skeleton className="w-[48px] max-w-full" />
                            </div>
                        </div>
                    </form>
                </div>
                <div className="border  shadow-md p-4 md:px-6 md:col-span-3">
                    <div className="max-w-full overflow-x-auto">
                        <div className="flex items-center gap-3 mb-3">
                            <Skeleton className="w-[120px] max-w-full" />
                            <div className="p-2 from-blue-500">
                                <SVGSkeleton className="w-[24px] h-[24px]" />
                            </div>
                        </div>
                        <div className="border  w-full">
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom">
                                    <thead className="[&amp;_tr]:border-b">
                                        <tr className="border-b transition-colors from-[#5E4AE3] hover:from-[#5E4AE3]">
                                            <th className="h-12 px-4 text-left align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <Skeleton className="w-[104px] max-w-full" />
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <Skeleton className="w-[64px] max-w-full" />
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <Skeleton className="w-[24px] max-w-full" />
                                            </th>
                                            <th className="h-12 px-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <Skeleton className="w-[48px] max-w-full" />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&amp;_tr:last-child]:border-0">
                                        <tr className="border-b transition-colors">
                                            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <Skeleton className="w-[64px] max-w-full" />
                                            </td>
                                            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <span className="inline-flex items-center px-2.5 py-0.5 min-w-12 md:min-w-20 justify-center">
                                                    <Skeleton className="w-[16px] max-w-full" />
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <div className="flex items-center justify-center gap-2">
                                                    <a className="inline-block px-3 py-1.5 border  transition-colors">
                                                        <SVGSkeleton className="w-[24px] h-[24px]" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border  transition-colors">
                                                        <SVGSkeleton className="lucide-trash-2 w-[24px] h-[24px]" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 z-50 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full  p-3">
                                                                        <Skeleton className="w-[48px] max-w-full" />
                                                                    </div>
                                                                </div>
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border border-stroke p-3 hover:border-red-800">
                                                                        <Skeleton className="w-[48px] max-w-full" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="border-b transition-colors">
                                            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <Skeleton className="w-[72px] max-w-full" />
                                            </td>
                                            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <span className="inline-flex items-center px-2.5 py-0.5 min-w-12 md:min-w-20 justify-center">
                                                    <Skeleton className="w-[72px] max-w-full" />
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <div className="flex items-center justify-center gap-2">
                                                    <a className="inline-block px-3 py-1.5 border  transition-colors">
                                                        <SVGSkeleton className="w-[24px] h-[24px]" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border  transition-colors">
                                                        <SVGSkeleton className="lucide-trash-2 w-[24px] h-[24px]" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 z-50 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full  p-3">
                                                                        <Skeleton className="w-[48px] max-w-full" />
                                                                    </div>
                                                                </div>
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border border-stroke p-3 hover:border-red-800">
                                                                        <Skeleton className="w-[48px] max-w-full" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="border-b transition-colors">
                                            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <Skeleton className="w-[64px] max-w-full" />
                                            </td>
                                            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <span className="inline-flex items-center px-2.5 py-0.5 min-w-12 md:min-w-20 justify-center">
                                                    <Skeleton className="w-[16px] max-w-full" />
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                                <div className="flex items-center justify-center gap-2">
                                                    <a className="inline-block px-3 py-1.5 border  transition-colors">
                                                        <SVGSkeleton className="w-[24px] h-[24px]" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border  transition-colors">
                                                        <SVGSkeleton className="lucide-trash-2 w-[24px] h-[24px]" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 z-50 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full  p-3">
                                                                        <Skeleton className="w-[48px] max-w-full" />
                                                                    </div>
                                                                </div>
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border border-stroke p-3 hover:border-red-800">
                                                                        <Skeleton className="w-[48px] max-w-full" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </>
);

const SandboxPreview = () => (
    //   <div className="flex justify-center w-full h-full p-10">
    <div className="flex justify-center w-full h-full p-10">
        <LoadingSkeleton />
    </div>
);

const Skeleton = ({ className }) => (
    <div aria-live="polite" aria-busy="true" className={className}>
        <span className="inline-flex w-full animate-pulse select-none rounded-md bg-gray-300 leading-none">
            ‌
        </span>
        <br />
    </div>
);

const SVGSkeleton = ({ className }) => (
    <svg className={className + " animate-pulse rounded bg-gray-300"} />
);

export { SandboxPreview, LoadingSkeleton, SVGSkeleton };
