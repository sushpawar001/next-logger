"use client";
import {
  greedyApproach,
  calcOneSideWeight,
  robustApproach,
} from "@/helpers/loadCalcHelpers";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function LoadCalc() {
  const [barWeight, setBarWeight] = useState(20);
  const [Load, setLoad] = useState(0);
  const [OneSideLoad, setOneSideLoad] = useState(0);
  const [availablePlates, setAvailablePlates] = useState([
    2.5, 5, 10, 15, 20,
  ]);
  const [availablePlatesInput, setAvailablePlatesInput] = useState(
    String(availablePlates)
  );
  const [platesToLoad, setplatesToLoad] = useState([]);
  const [isGreedy, setIsGreedy] = useState(false);

  const changeBarWeight = (event: { target: { value: string } }): void => {
    setBarWeight(parseFloat(event.target.value));
  };

  const changeLoad = (event: { target: { value: string } }): void => {
    setLoad(parseFloat(event.target.value));
  };

  const changeAvailablePlates = (event: {
    target: { value: string };
  }): void => {
    let numbersString = event.target.value;
    setAvailablePlatesInput(numbersString);
    let numbersArray = numbersString.split(",").filter(Boolean).map(Number);
    numbersArray = numbersArray.filter((number) => !isNaN(number));
    setAvailablePlates(numbersArray);
    localStorage.setItem("availablePlates", JSON.stringify(numbersArray));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const item = JSON.parse(localStorage.getItem("availablePlates"));
      if (item) {
        setAvailablePlates(item);
        setAvailablePlatesInput(String(item));
      }
    }
  }, []);

  useEffect(() => {
    setOneSideLoad(calcOneSideWeight(Load, barWeight));
  }, [Load, barWeight]);

  useEffect(() => {
    const platesToLoad = isGreedy
      ? greedyApproach(OneSideLoad, availablePlates)
      : robustApproach(Load, barWeight, availablePlates);
    setplatesToLoad(platesToLoad);
  }, [Load, OneSideLoad, availablePlates, barWeight, isGreedy]);

  const TdStyle = {
    ThStyle: `w-1/6 min-w-[70px] border-l border-transparent px-3 py-2 text-base font-medium text-white lg:px-4`,
    TdStyle2: `text-dark border border-[#E8E8E8] bg-white p-2 text-center font-normal text-base`,
  };

  return (
    <div className="w-full md:w-fit grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 justify-center items-center">
      <div className="text-secondary p-2 col-span-1 text-center">
        <p>One side weight: {OneSideLoad}kg</p>
        {platesToLoad.length > 0 ? (
          <motion.table
            className="table-auto my-2"
            initial={{ opacity: 0, y: "-10%" }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              duration: 0.5,
              stiffness: 150,
            }}
          >
            <thead className="bg-secondary">
              <motion.tr
                initial={{ opacity: 0, y: "-50%" }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  duration: 0.3,
                  stiffness: 150,
                }}
              >
                <th
                  className={`${TdStyle.ThStyle} rounded-tl-lg`}
                >
                  Set
                </th>
                <th className={`${TdStyle.ThStyle}`}>Plates</th>
                <th
                  className={`${TdStyle.ThStyle} rounded-tr-lg`}
                >
                  Progression
                </th>
              </motion.tr>
            </thead>
            <tbody>
              {platesToLoad.map((elem, id, array) => {
                const cumulativeSum = array
                  .slice(0, id + 1)
                  .reduce((acc, val) => acc + val, 0);
                return (
                  <motion.tr
                    key={id}
                    initial={{ opacity: 0, y: "-50%" }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      duration: 0.3,
                      stiffness: 150,
                      delay: id < 6 ? id * 0.15 : 0.15 * 6,
                    }}
                  >
                    <td className={TdStyle.TdStyle2}>
                      {id + 1}
                    </td>
                    <td className={TdStyle.TdStyle2}>
                      {elem} kg
                    </td>
                    <td className={TdStyle.TdStyle2}>
                      {cumulativeSum * 2 + barWeight} kg
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </motion.table>
        ) : (
          <p>Enter weight to see sets</p>
        )}
      </div>

      <div className="order-1 md:order-first col-span-1 justify-center">
        <div className="mb-4">
          <Switcher isGreedy={isGreedy} setIsGreedy={setIsGreedy} />
        </div>
        <div className="mb-4">
          <label
            htmlFor="Load"
            className="block mb-2 text-sm font-medium text-secondary"
          >
            Enter Load to lift (kg)
          </label>
          <input
            type="number"
            id="Load"
            className="bg-gray-50 border border-stone-400  text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5"
            value={Load}
            onChange={changeLoad}
            min={0}
            max={1000}
            step="any"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="availablePlates"
            className="block mb-2 text-sm font-medium text-secondary"
          >
            Enter available plates
          </label>
          <input
            type="text"
            id="availablePlates"
            className="bg-gray-50 border border-stone-400  text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5"
            value={availablePlatesInput}
            onChange={changeAvailablePlates}
            required
          />
        </div>

        <div>
          <label
            htmlFor="barWeight"
            className="block mb-2 text-sm font-medium text-secondary"
          >
            Enter bar weight (kg)
          </label>
          <input
            type="number"
            id="barWeight"
            className="bg-gray-50 border border-stone-400 text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5"
            value={barWeight}
            onChange={changeBarWeight}
            min={0}
            required
          />
        </div>
      </div>
    </div>
  );
}

const Switcher = ({
  isGreedy,
  setIsGreedy,
}: {
  isGreedy: boolean;
  setIsGreedy: any;
}) => {
  const handleCheckboxChange = () => {
    setIsGreedy(!isGreedy);
  };

  return (
    <>
      <label className="w-full border border-primary inline-flex cursor-pointer select-none items-center justify-center rounded-xl bg-white">
        <input
          type="checkbox"
          className="sr-only"
          checked={isGreedy}
          onChange={handleCheckboxChange}
        />
        <span
          className={`flex flex-grow items-center justify-center rounded-l-lg py-2 px-4 text-sm font-medium ${!isGreedy ? "text-white bg-primary" : "text-body-color"
            }`}
        >
          Robust Mode
        </span>
        <span
          className={`flex flex-grow items-center justify-center rounded-r-lg py-2 px-4 text-sm font-medium ${isGreedy ? "text-white bg-primary" : "text-body-color"
            }`}
        >
          Greedy Mode
        </span>
      </label>
    </>
  );
};
