import LoadCalc from "@/components/LoadCalc";
import React from "react";

export default function Load() {
  return (
    <div className="h-full flex justify-center items-center bg-background py-5 px-5">
      <div className="max-w-full p-5 md:p-7 rounded-xl bg-white shadow">
        <LoadCalc />
      </div>
    </div>
  );
}
