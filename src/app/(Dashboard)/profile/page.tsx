"use client";
import AddNewInsulin from "@/components/ProfileComponents/AddNewInsulin";
import DashboardPreferences from "@/components/ProfileComponents/DashboardPref";
import UserInsulins from "@/components/ProfileComponents/UserInsulins";
import { useState, useEffect, SetStateAction } from "react";
import type { InsulinNameType } from "@/types/models";
import axios from "axios";

export default function ProfilePage() {
    const [allAvailableInsulins, setAllAvailableInsulins] = useState<
        InsulinNameType[]
    >([]);
    const [userInsulins, setUserInsulins] = useState<InsulinNameType[]>([]);

    useEffect(() => {
        const getData = async () => {
            const response = await axios.get("/api/insulin-type/get/");
            setAllAvailableInsulins(response.data.data);
        };
        getData();
    }, []);

    useEffect(() => {
        const getData = async () => {
            const resposne = await axios.get("/api/users/get-insulin/");
            let fetchedData: InsulinNameType[] = resposne.data.data;
            setUserInsulins(fetchedData);
        };
        getData();
    }, []);

    return (
        <div className="h-full py-5 px-5">
            <div className="flex flex-col max-w-screen-lg mx-auto justify-center h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* <DashboardPreferences className="col-span-1 md:col-span-2" /> */}
                    <UserInsulins
                        className="col-span-1"
                        allAvailableInsulins={allAvailableInsulins}
                        userInsulins={userInsulins}
                        setUserInsulins={setUserInsulins}
                    />
                    <AddNewInsulin
                        className="col-span-1"
                        setAllAvailableInsulins={setAllAvailableInsulins}
                        setUserInsulins={setUserInsulins}
                    />
                </div>
            </div>
        </div>
    );
}
