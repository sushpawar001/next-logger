"use client";
import React, { useState, useEffect } from "react";
import notify from "@/helpers/notify";
import axios from "axios";

type InsulinType = {
  _id: string,
  name: string,
  createdAt: string,
}

export default function InsulinTypeAdd(props: { data: InsulinType[]; setData: any; }) {
  const [insulinType, setInsulinType] = useState("");
  const [allInsulinType, setallInsulinType] = useState<InsulinType[]>([]);
  const [newInsulinType, setNewInsulinType] = useState("");
  const { data, setData } = props;
  
  const changeInsulinType = (event: { target: { value: string; }; }) => {
    const insulinTypeInput = event.target.value;
    setInsulinType(insulinTypeInput);
  };

  const changeNewInsulinType = (event: { target: { value: string; }; }) => {
    const newInsulinTypeInput = event.target.value;
    setNewInsulinType(newInsulinTypeInput);
  };
  const sortData = (data: InsulinType[]) => {
    return data.sort((a, b) => a.name.localeCompare(b.name));
  };

  const submitNewInsulin = async (e) => {
    e.preventDefault();
    try {
      if (
        !allInsulinType.some(
          (obj) => obj.name.toLowerCase() === newInsulinType.toLowerCase()
        )
      ) {
        const response = await axios.post("/api/insulin-type/add/", {
          name: newInsulinType,
        });
        notify(response.data.message, "success");
        setNewInsulinType("");
        setallInsulinType((data) => [...data, response.data.entry]);

        const addResponse = await axios.post("/api/users/add-insulin/", {
          name: response.data.entry.name,
        });
        setData((data) => [...data, addResponse.data.insulin]);
      } else {
        notify("Insulin already exists!", "error");
        setNewInsulinType("");
      }
    } catch (error) {
      notify(error.response.data.message, "error");
    }
  };

  const submitUserInsulin = async (e) => {
    e.preventDefault();
    try {
      if (
        !data.some(
          (obj) => obj.name.toLowerCase() === insulinType.toLowerCase()
        )
      ) {
        const response = await axios.post("/api/users/add-insulin/", {
          name: insulinType,
        });
        setData((data) => [...data, response.data.insulin]);
        notify(response.data.message, "success");
        setNewInsulinType("");
      } else {
        notify("Insulin already exists!", "error");
      }
    } catch (error) {
      notify(error.response.data.message, "error");
    }
  };

  useEffect(() => {
    const getAllInsulinTypes = async () => {
      const reponse = await axios.get("/api/insulin-type/get/");
      let sortedData = sortData(reponse.data.data);
      setallInsulinType(sortedData);
    };
    getAllInsulinTypes();
  }, []);

  return (
    <>
      <form
        className="max-w-full mx-auto p-5 md:p-7 rounded-lg bg-white shadow mb-3 md:mb-5"
        onSubmit={submitUserInsulin}
      >
        <label
          htmlFor="insulinType"
          className="block mb-2 text-sm font-medium text-secondary"
        >
          Add insulin to your profile
        </label>
        <div className="flex flex-col md:flex-row gap-2">
          <select
            id="insulinType"
            value={insulinType}
            onChange={changeInsulinType}
            className="bg-gray-50 border border-stone-400 text-gray-900 text-sm rounded-lg focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5 invalid:text-gray-400"
            required
          >
            <option value="" disabled>
              Select Type
            </option>
            {allInsulinType.map((data) => (
              <option key={data._id} value={data.name}>
                {data.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center transition duration-300"
          >
            Submit
          </button>
        </div>
      </form>
      <form
        className="max-w-full mx-auto p-5 md:p-7 rounded-lg bg-white shadow"
        onSubmit={submitNewInsulin}
      >
        <label
          htmlFor="newInsulinType"
          className="block mb-2 text-sm font-medium text-secondary"
        >
          Add new insulin (if not available)
        </label>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            id="newInsulinType"
            className="bg-gray-50 border border-stone-400 text-gray-900 text-sm rounded-lg focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5"
            placeholder="Actrapid"
            value={newInsulinType}
            onChange={changeNewInsulinType}
            required
          />
          <button
            type="submit"
            className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center transition duration-300"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
}
