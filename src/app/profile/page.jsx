"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import InsulinTypeAdd from "@/components/InsulinTypeAdd";
import UserDetails from "@/components/UserDetails";

export default function ProfilePage() {
  const [userInsulins, setUserInsulins] = useState([]);
  useEffect(() => {
    const getData = async () => {
      const resposne = await axios.get("/api/users/get-insulin/");
      setUserInsulins(resposne.data.data);
    };
    getData();
  }, []);
  return (
    <div className="h-full flex justify-center items-center bg-background py-5 px-5 md:px-20">
      <div className="w-full md:w-fit grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
        <div className="max-w-full p-5 md:p-6 rounded-xl bg-white shadow-md col-span-1 md:col-span-2">
          <h2 className="text-center block text-2xl font-bold text-secondary">
            Add Your insulins here
          </h2>
        </div>
        <div className="col-span-1">
          <UserDetails data={userInsulins} />
        </div>
        <div className="col-span-1">
          <InsulinTypeAdd data={userInsulins} setData={setUserInsulins} />
        </div>
      </div>
    </div>
  );
}
