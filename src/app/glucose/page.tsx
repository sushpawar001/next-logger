"use client";
import React, { useEffect, useRef, useState } from "react";
import GlucoseAdd from "@/components/GlucoseAdd";
import GlucoseChart from "@/components/GlucoseChart";
import formatDate from "@/helpers/formatDate";
import notify from "@/helpers/notify";
import axios from "axios";
import Link from "next/link";

const TdStyle = {
  ThStyle: `w-1/6 lg:min-w-[180px] border-l border-transparent py-3 px-3 text-base font-medium text-white lg:px-4`,
  TdStyle: `text-dark border-b border-l border-[#E8E8E8] bg-[#F3F6FF] py-2 px-3 text-center font-normal text-base`,
  TdStyle2: `text-dark border-b border-[#E8E8E8] bg-white py-2 px-3 text-center font-normal text-base`,
  TdButton: `inline-block px-4 py-1.5 border rounded-md border-primary text-primary hover:bg-primary hover:text-white font-normal text-base`,
  TdButton2: `inline-block px-3 py-1.5 border rounded-md border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-normal text-base`,
};

export default function GlucosePage() {
  const [glucoseData, setGlucoseData] = useState([]);
  const [daysOfData, setDaysOfData] = useState(7);

  useEffect(() => {
    const getGlucoseData = async () => {
      try {
        axios.get(`/api/glucose/get/${daysOfData}/`).then((response) => {
          if (response.status === 200) {
            setGlucoseData(response.data.data);
          } else {
            console.error("API request failed with status:", response.status);
          }
        });
      } catch (error) {
        console.log(error);
      }
    };
    getGlucoseData();
  }, [daysOfData]);

  const changeDaysOfData = (event: { target: { value: string } }) => {
    const daysInput = event.target.value;
    setDaysOfData(parseInt(daysInput));
  };

  const deleteData = async (id) => {
    try {
      const deletedData = await axios.delete(`/api/glucose/delete/${id}`);
      let updatedData = glucoseData.filter((obj) => obj._id !== id);
      setGlucoseData(updatedData);
      notify("Glucose data deleted!", "success");
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
                  Glucose History
                </h3>
                <select
                  id="daysOfDataInput"
                  value={daysOfData}
                  onChange={changeDaysOfData}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary block w-full p-2.5"
                >
                  <option defaultValue="7">7</option>
                  <option>14</option>
                  <option>30</option>
                  <option>90</option>
                  <option>365</option>
                  <option value={365 * 10}>All</option>
                </select>
              </div>
              <table className="table-auto">
                <thead className="text-center bg-secondary">
                  <tr>
                    <th className={`${TdStyle.ThStyle} rounded-tl-lg`}>
                      {" "}
                      Blood Glucose{" "}
                    </th>
                    <th className={TdStyle.ThStyle}> DateTime </th>
                    <th className={`${TdStyle.ThStyle} rounded-tr-lg`}>
                      {" "}
                      Action{" "}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {glucoseData.map((obj) => {
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
            <GlucoseChart data={glucoseData} />
          </div>
          <GlucoseAdd data={glucoseData} setData={setGlucoseData} />
        </div>
      </div>
    </section>
  );
}

function TableRow(props) {
  const { value, createdAt, _id } = props.data;
  return (
    <tr>
      <td className={TdStyle.TdStyle}>{value}</td>
      <td className={TdStyle.TdStyle2}>{formatDate(createdAt)}</td>
      <td className={TdStyle.TdStyle}>
        <div className="flex gap-2">
          <Link href={`/glucose/${_id}`} className={TdStyle.TdButton}>
            Edit
          </Link>
          {/* <button className={TdStyle.TdButton2} onClick={() => { props.delete(_id) }}>Delete</button> */}
          <Modal
            delete={() => {
              props.delete(_id);
            }}
          />
        </div>
      </td>
    </tr>
  );
}

function Modal(props) {
  const [modalOpen, setModalOpen] = useState(false);

  const trigger = useRef(null);
  const modal = useRef(null);

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
        className={`fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center bg-dark/90 px-4 py-5 ${
          modalOpen ? "block" : "hidden"
        }`}
      >
        <div
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
        </div>
      </div>
    </>
  );
}
