const MeasurementPageSkeleton = () => (
    <>
        <div className="bg-background h-full py-5 px-5">
            <div className="flex flex-col max-w-screen-xl mx-auto">
                <div className="grid md:grid-cols-3 mb-5 gap-5">
                    <form className="max-w-full p-5 md:p-7 rounded-xl bg-white/65 shadow-md flex items-center justify-center order-2 md:order-1">
                        <div className="grid grid-cols-4 gap-2.5 w-full">
                            <label className="block my-auto mr-2">
                                <Skeleton className="w-[32px] max-w-full" />
                            </label>
                            <div className="border border-stone-400 focus:border-primary-ring block w-full p-2 col-span-3">
                                <Skeleton className="w-[32px] max-w-full" />
                            </div>
                            <label className="block my-auto mr-2">
                                <Skeleton className="w-[40px] max-w-full" />
                            </label>
                            <div className="border border-stone-400 focus:border-primary-ring block w-full p-2 col-span-3">
                                <Skeleton className="w-[40px] max-w-full" />
                            </div>
                            <label className="block my-auto mr-2">
                                <Skeleton className="w-[56px] max-w-full" />
                            </label>
                            <div className="border border-stone-400 focus:border-primary-ring block w-full p-2 col-span-3">
                                <Skeleton className="w-[56px] max-w-full" />
                            </div>
                            <label className="block my-auto mr-2">
                                <Skeleton className="w-[40px] max-w-full" />
                            </label>
                            <div className="border border-stone-400 focus:border-primary-ring block w-full p-2 col-span-3">
                                <Skeleton className="w-[40px] max-w-full" />
                            </div>
                            <label className="block my-auto mr-2">
                                <Skeleton className="w-[24px] max-w-full" />
                            </label>
                            <div className="border border-stone-400 focus:border-primary-ring block w-full p-2 col-span-3">
                                <Skeleton className="w-[24px] max-w-full" />
                            </div>
                            <label className="block my-auto mr-2">
                                <Skeleton className="w-[48px] max-w-full" />
                            </label>
                            <div className="border border-stone-400 focus:border-primary-ring block w-full p-2 col-span-3">
                                <Skeleton className="w-[48px] max-w-full" />
                            </div>
                            <label className="block my-auto mr-2">
                                <Skeleton className="w-[48px] max-w-full" />
                            </label>
                            <div className="border border-stone-400 focus:border-primary-ring block w-full p-2 col-span-3">
                                <Skeleton className="w-[48px] max-w-full" />
                            </div>
                            <div className="col-span-4 grid grid-cols-4 gap-1">
                                <div className="w-full px-5 py-2.5 col-span-3">
                                    <Skeleton className="w-[48px] max-w-full" />
                                </div>
                                <div className="w-full px-5 py-2.5 col-span-1">
                                    <Skeleton className="w-[40px] max-w-full" />
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className="col-span-1 md:col-span-2 max-w-full p-5 min-h-96 md:min-h-0 rounded-xl bg-white/65 shadow-md order-1 md:order-2">
                        <div>
                            <SVGSkeleton className="w-full h-[390px]" />
                            <div>
                                <ul className="flex mt-2 gap-2 justify-center">
                                    <li className="legend-item-0">
                                        <SVGSkeleton className="w-[14px] h-[14px]" />
                                        <span className="recharts-legend-item-text"></span>
                                    </li>
                                    <li className="legend-item-1">
                                        <SVGSkeleton className="w-[14px] h-[14px]" />
                                        <span className="recharts-legend-item-text"></span>
                                    </li>
                                    <li className="legend-item-2">
                                        <SVGSkeleton className="w-[14px] h-[14px]" />
                                        <span className="recharts-legend-item-text"></span>
                                    </li>
                                    <li className="legend-item-3">
                                        <SVGSkeleton className="w-[14px] h-[14px]" />
                                        <span className="recharts-legend-item-text"></span>
                                    </li>
                                    <li className="legend-item-4">
                                        <SVGSkeleton className="w-[14px] h-[14px]" />
                                        <span className="recharts-legend-item-text"></span>
                                    </li>
                                    <li className="legend-item-5">
                                        <SVGSkeleton className="w-[14px] h-[14px]" />
                                        <span className="recharts-legend-item-text"></span>
                                    </li>
                                    <li className="legend-item-6">
                                        <SVGSkeleton className="w-[14px] h-[14px]" />
                                        <span className="recharts-legend-item-text"></span>
                                    </li>
                                </ul>
                            </div>
                            <div className="recharts-tooltip-wrapper recharts-tooltip-wrapper-right recharts-tooltip-wrapper-bottom">
                                <div>
                                    <p className="recharts-tooltip-label"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white/65 p-4 rounded-xl shadow-md">
                    <div className="flex flex-wrap">
                        <div className="max-w-full w-full overflow-x-auto">
                            <div className="mb-2 grid grid-cols-2">
                                <h3 className="my-auto ml-1">
                                    <Skeleton className="w-[152px] max-w-full" />
                                </h3>
                                <div className="border border-gray-300 focus:border-primary block w-full p-2.5"></div>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full">
                                    <thead className="top-0 z-10">
                                        <tr>
                                            <th className="md:w-[1/9] border-l border-transparent py-1 px-2 md:py-3 md:px-3 lg:px-4">
                                                <Skeleton className="w-[32px] max-w-full" />
                                            </th>
                                            <th className="md:w-[1/9] border-l border-transparent py-1 px-2 md:py-3 md:px-3 lg:px-4">
                                                <Skeleton className="w-[40px] max-w-full" />
                                            </th>
                                            <th className="md:w-[1/9] border-l border-transparent py-1 px-2 md:py-3 md:px-3 lg:px-4">
                                                <Skeleton className="w-[56px] max-w-full" />
                                            </th>
                                            <th className="md:w-[1/9] border-l border-transparent py-1 px-2 md:py-3 md:px-3 lg:px-4">
                                                <Skeleton className="w-[40px] max-w-full" />
                                            </th>
                                            <th className="md:w-[1/9] border-l border-transparent py-1 px-2 md:py-3 md:px-3 lg:px-4">
                                                <Skeleton className="w-[24px] max-w-full" />
                                            </th>
                                            <th className="md:w-[1/9] border-l border-transparent py-1 px-2 md:py-3 md:px-3 lg:px-4">
                                                <Skeleton className="w-[48px] max-w-full" />
                                            </th>
                                            <th className="md:w-[1/9] border-l border-transparent py-1 px-2 md:py-3 md:px-3 lg:px-4">
                                                <Skeleton className="w-[48px] max-w-full" />
                                            </th>
                                            <th className="w-1/6 lg:min-w-[180px] border-l border-transparent py-3 px-3 lg:px-4">
                                                <Skeleton className="w-[80px] max-w-full" />
                                            </th>
                                            <th className="w-1/6 lg:min-w-[180px] border-l border-transparent py-3 px-3 lg:px-4">
                                                <Skeleton className="w-[64px] max-w-full" />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[14px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[14px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[14px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[14px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[14px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[14px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[32px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[32px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[32px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[32px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[32px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[32px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[32px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[14px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[14px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[24px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[14px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[14px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
                                        <tr>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[14px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[16px] max-w-full" />
                                            </td>
                                            <td className="border-b border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <Skeleton className="w-[152px] max-w-full" />
                                            </td>
                                            <td className="border-b border-l border-[#E8E8E8] py-1 px-2 md:py-2 md:px-3">
                                                <div className="flex gap-2">
                                                    <a className="inline-block px-4 py-1.5 border border-primary">
                                                        <Skeleton className="w-[32px] max-w-full" />
                                                    </a>
                                                    <div className="inline-block px-3 py-1.5 border border-red-600">
                                                        <Skeleton className="w-[48px] max-w-full" />
                                                    </div>
                                                    <div className="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center px-4 py-5 hidden">
                                                        <div className="w-full max-w-[500px] px-8 py-12 md:px-[70px] md:py-[60px]">
                                                            <h3 className="pb-[18px]">
                                                                <Skeleton className="w-[272px] max-w-full" />
                                                            </h3>
                                                            <span className="mx-auto mb-6 inline-block h-1 w-[90px]"></span>
                                                            <div className="-mx-3 flex flex-wrap">
                                                                <div className="w-1/2 px-3">
                                                                    <div className="block w-full border-primary p-3">
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
        </div>
    </>
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

export default MeasurementPageSkeleton;
