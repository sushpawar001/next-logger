const LoadingSkeleton = () => (
  <>
    <section className="bg-background h-full flex justify-center items-center p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="p-4 shadow-md order-1 md:order-first bg-white">
          <div className="flex flex-wrap">
            <div className="max-w-full overflow-x-auto">
              <div className="mb-2 grid grid-cols-2">
                <h3 className="my-auto ml-1">
                  <Skeleton className="w-[120px] max-w-full" />
                </h3>
                <div className="border border-gray-300 focus:border-primary block w-full p-1.5 rounded-xl">
                  <Skeleton className="w-[200px] max-w-full" />
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th className="w-1/6 lg:min-w-[180px] border-l border-transparent py-3 px-3 lg:px-4">
                      <Skeleton className="w-[120px] max-w-full" />
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
                    <td className="border-b border-l border-[#E8E8E8] py-2 px-3">
                      <Skeleton className="w-[24px] max-w-full" />
                    </td>
                    <td className="border-b border-[#E8E8E8] py-2 px-3">
                      <Skeleton className="w-[152px] max-w-full" />
                    </td>
                    <td className="border-b border-l border-[#E8E8E8] py-2 px-3">
                      <div className="flex gap-2">
                        <a className="inline-block px-4 py-1.5 border rounded-md">
                          <Skeleton className="w-[32px] max-w-full" />
                        </a>
                        <div className="inline-block px-3 py-1.5 border rounded-md">
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
                                <div className="block w-full p-3">
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
                    <td className="border-b border-l border-[#E8E8E8] py-2 px-3">
                      <Skeleton className="w-[24px] max-w-full" />
                    </td>
                    <td className="border-b border-[#E8E8E8] py-2 px-3">
                      <Skeleton className="w-[152px] max-w-full" />
                    </td>
                    <td className="border-b border-l border-[#E8E8E8] py-2 px-3">
                      <div className="flex gap-2">
                        <a className="inline-block px-4 py-1.5 border rounded-md">
                          <Skeleton className="w-[32px] max-w-full" />
                        </a>
                        <div className="inline-block px-3 py-1.5 border rounded-md">
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
                                <div className="block w-full p-3">
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
                    <td className="border-b border-l border-[#E8E8E8] py-2 px-3">
                      <Skeleton className="w-[24px] max-w-full" />
                    </td>
                    <td className="border-b border-[#E8E8E8] py-2 px-3">
                      <Skeleton className="w-[152px] max-w-full" />
                    </td>
                    <td className="border-b border-l border-[#E8E8E8] py-2 px-3">
                      <div className="flex gap-2">
                        <a className="inline-block px-4 py-1.5 border rounded-md">
                          <Skeleton className="w-[32px] max-w-full" />
                        </a>
                        <div className="inline-block px-3 py-1.5 border rounded-md">
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
                                <div className="block w-full p-3">
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
                    <td className="border-b border-l border-[#E8E8E8] py-2 px-3">
                      <Skeleton className="w-[24px] max-w-full" />
                    </td>
                    <td className="border-b border-[#E8E8E8] py-2 px-3">
                      <Skeleton className="w-[152px] max-w-full" />
                    </td>
                    <td className="border-b border-l border-[#E8E8E8] py-2 px-3">
                      <div className="flex gap-2">
                        <a className="inline-block px-4 py-1.5 border rounded-md">
                          <Skeleton className="w-[32px] max-w-full" />
                        </a>
                        <div className="inline-block px-3 py-1.5 border rounded-md">
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
                    <td className="border-b border-l border-[#E8E8E8] py-2 px-3">
                      <Skeleton className="w-[24px] max-w-full" />
                    </td>
                    <td className="border-b border-[#E8E8E8] py-2 px-3">
                      <Skeleton className="w-[152px] max-w-full" />
                    </td>
                    <td className="border-b border-l border-[#E8E8E8] py-2 px-3">
                      <div className="flex gap-2">
                        <a className="inline-block px-4 py-1.5 border rounded-md">
                          <Skeleton className="w-[32px] max-w-full" />
                        </a>
                        <div className="inline-block px-3 py-1.5 border rounded-md">
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
        <div>
          <div className="mb-4 md:mb-6 mx-auto px-10 py-5 shadow-md h-72 bg-white">
            <canvas height="272" width="329"></canvas>
          </div>
          <form className="max-w-full mx-auto p-5 md:p-7 shadow-md bg-white">
            <label className="block mb-2">
              <Skeleton className="w-[144px] max-w-full" />
            </label>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="border rounded-xl border-stone-400 focus:border-primary-ring block w-full p-2.5">
                <Skeleton className="w-[64px] max-w-full" />
              </div>
              <div className="w-full sm:w-auto px-5 py-2.5">
                <Skeleton className="w-[48px] max-w-full" />
              </div>
            </div>
          </form>
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
