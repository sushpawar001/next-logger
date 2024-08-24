import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const MotionDiv = dynamic(
    () => import("framer-motion").then((mod) => mod.motion.div),
    {
        ssr: false,
    }
);

const TdStyle = {
    ThStyle: `border-l border-transparent py-3 px-3 text-sm xl:text-base font-medium text-white lg:px-4`,
    ThStyleNew: `border-l border-transparent py-3 px-3 text-sm xl:text-base font-medium text-white lg:px-4`,
    // ThStyleNew: `md:w-[1/9] border-l border-transparent py-1 px-2 md:py-3 md:px-3 text-base font-medium text-white lg:px-4`,
    TdStyle: `text-dark border-b border-l border-[#E8E8E8] bg-[#F3F6FF] py-2 px-3 text-center font-normal text-sm xl:text-base`,
    TdStyle2: `text-dark border-b border-[#E8E8E8] bg-white py-2 px-3 text-center font-normal text-sm xl:text-base`,
    TdButton: `inline-block px-4 py-1.5 border rounded-md border-primary text-primary hover:bg-primary hover:text-white font-normal text-sm xl:text-base`,
    TdButton2: `inline-block px-3 py-1.5 border rounded-md border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-normal text-sm xl:text-base`,
};

export default function PopUpModal(props: { delete: () => void }) {
    const [modalOpen, setModalOpen] = useState(false);
    const trigger = useRef(null);
    const modal = useRef(null);

    const variants = {
        open: { opacity: 1, scale: 1 },
        closed: { opacity: 0, scale: 0.6 },
    };

    // close on click outside
    useEffect(() => {
        const clickHandler = ({ target }) => {
            if (!modal.current) return;
            if (
                !modalOpen ||
                modal.current.contains(target) ||
                trigger.current.contains(target)
            )
                return;
            setModalOpen(false);
        };
        document.addEventListener("click", clickHandler);
        return () => document.removeEventListener("click", clickHandler);
    });

    // close if the esc key is pressed
    useEffect(() => {
        const keyHandler = ({ keyCode }) => {
            if (!modalOpen || keyCode !== 27) return;
            setModalOpen(false);
        };
        document.addEventListener("keydown", keyHandler);
        return () => document.removeEventListener("keydown", keyHandler);
    });
    return (
        <>
            <button
                ref={trigger}
                onClick={() => setModalOpen(true)}
                className={TdStyle.TdButton2}
            >
                Delete
            </button>
            {/* modal  */}
            <div
                className={`fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center bg-dark/90 px-4 py-5 z-50 ${
                    modalOpen ? "block" : "hidden"
                }`}
            >
                <MotionDiv
                    animate={modalOpen ? "open" : "closed"}
                    variants={variants}
                    transition={{
                        type: "spring",
                        duration: 0.3,
                        stiffness: 100,
                    }}
                    ref={modal}
                    onFocus={() => setModalOpen(true)}
                    onBlur={() => setModalOpen(false)}
                    className="w-full max-w-[500px] rounded-[20px] bg-white px-8 py-12 text-center md:px-[70px] md:py-[60px]"
                >
                    <h3 className="pb-[18px] text-xl font-semibold text-secondary dark:text-white sm:text-2xl">
                        Do you really want to delete this?
                    </h3>
                    <span
                        className={`mx-auto mb-6 inline-block h-1 w-[90px] rounded bg-primary`}
                    ></span>
                    <div className="-mx-3 flex flex-wrap">
                        <div className="w-1/2 px-3">
                            <button
                                className="block w-full rounded-xl border-primary bg-primary p-3 text-center text-base font-medium text-white transition hover:bg-primary-dark"
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                        <div className="w-1/2 px-3">
                            <button
                                className="block w-full rounded-xl bg-red-600 border border-stroke p-3 text-center text-base font-medium transition hover:border-red-800 hover:bg-red-800 text-white"
                                onClick={() => {
                                    props.delete();
                                    setModalOpen(false);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </MotionDiv>
            </div>
        </>
    );
}
