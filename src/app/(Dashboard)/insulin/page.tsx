"use client";
import React, { useEffect, useRef, useState } from "react";
import formatDate from "@/helpers/formatDate";
import notify from "@/helpers/notify";
import axios from "axios";
import Link from "next/link";
import InsulinAdd from "@/components/InsulinAdd";
import InsulinChartSeparate from "@/components/InsulinChartSeparate";
import PopUpModal from "@/components/PopUpModal";

const TdStyle = {
  ThStyle: `w-1/6 lg:min-w-[100px] border-l border-transparent py-3 px-3 text-base font-medium text-white lg:px-4`,
  TdStyle: `text-dark border-b border-l border-[#E8E8E8] bg-[#F3F6FF] py-2 px-3 text-center font-normal text-base`,
  TdStyle2: `text-dark border-b border-[#E8E8E8] bg-white py-2 px-3 text-center font-normal text-base`,
  TdButton: `inline-block px-4 py-1.5 border rounded-md border-primary text-primary hover:bg-primary hover:text-white font-normal text-base`,
  TdButton2: `inline-block px-3 py-1.5 border rounded-md border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-normal text-base`,
};

type insulinEntryType = {
  _id: string;
  user: string;
  name: string;
  createdAt: string;
  units: number;
};

export default function InsulinPage() {
  const [insulinData, setInsulinData] = useState<insulinEntryType[]>([]);
  const [daysOfData, setDaysOfData] = useState(7);

  useEffect(() => {
    const getInsulinData = async () => {
      try {
        const response = await axios.get(`/api/insulin/get/${daysOfData}/`);
        if (response.status === 200) {
          let fetchedData: insulinEntryType[] = response.data.data;
          setInsulinData(fetchedData);
        } else {
          console.error("API request failed with status:", response.status);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getInsulinData();
  }, [daysOfData]);

  const changeDaysOfData = (event: { target: { value: string } }) => {
    const daysInput = event.target.value;
    setDaysOfData(parseInt(daysInput));
  };

  const deleteData = async (id: string) => {
    try {
      const deletedData = await axios.delete(`/api/insulin/delete/${id}`);
      let updatedData = insulinData.filter((obj) => obj._id !== id);
      setInsulinData(updatedData);
      notify("Insulin data deleted!", "success");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <section className="h-full flex justify-center items-center bg-background p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 rounded-xl shadow-md order-1 md:order-first">
          <div className="flex flex-wrap">
            <div className="max-w-full overflow-x-auto rounded-lg">
              <div className="mb-2 grid grid-cols-2">
                <h3 className="my-auto ml-1 text-lg font-medium text-gray-900">
                  Insulin History
                </h3>
                <select
                  id="daysOfDataInput"
                  value={daysOfData}
                  onChange={changeDaysOfData}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5"
                >
                  <option defaultValue="7">7</option>
                  <option>14</option>
                  <option>30</option>
                  <option>90</option>
                  <option>365</option>
                  <option value={365 * 100}>All</option>
                </select>
              </div>
              <table className="table-auto">
                <thead className="text-center bg-secondary">
                  <tr>
                    <th className={`${TdStyle.ThStyle} rounded-tl-lg`}>
                      {" "}
                      Blood Insulin{" "}
                    </th>
                    <th className={TdStyle.ThStyle}> Type </th>
                    <th className={TdStyle.ThStyle}> DateTime </th>
                    <th className={`${TdStyle.ThStyle} rounded-tr-lg`}>
                      {" "}
                      Action{" "}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {insulinData.map((obj) => {
                    return (
                      <TableRow key={obj._id} data={obj} delete={deleteData} />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-4 md:mb-6 mx-auto px-10 py-5 rounded-xl bg-white shadow-md h-72">
            <InsulinChartSeparate data={insulinData} />
          </div>
          <InsulinAdd data={insulinData} setData={setInsulinData} />
        </div>
      </div>
    </section>
  );
}

function TableRow(props: { data: insulinEntryType; delete: (arg0: string) => void; }) {
  const { units, name, createdAt, _id } = props.data;
  return (
    <tr>
      <td className={TdStyle.TdStyle}>{units}</td>
      <td className={TdStyle.TdStyle2}>{name}</td>
      <td className={TdStyle.TdStyle}>{formatDate(createdAt)}</td>
      <td className={TdStyle.TdStyle2}>
        <div className="flex gap-2">
          <Link href={`/insulin/${_id}`} className={TdStyle.TdButton}>
            Edit
          </Link>
          <PopUpModal
            delete={() => {
              props.delete(_id);
            }}
          />
        </div>
      </td>
    </tr>
  );
}
