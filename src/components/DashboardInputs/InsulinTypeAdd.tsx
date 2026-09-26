"use client";
import React, { useState, useEffect } from "react";
import notify from "@/helpers/notify";
import axios from "axios";
import { AppButton, Field, SelectInput, TextInput } from "@/components/app-ui/controls";

type InsulinType = {
    _id: string;
    name: string;
    createdAt: string;
};

export default function InsulinTypeAdd(props: {
    data: InsulinType[];
    setData: any;
}) {
    const [insulinType, setInsulinType] = useState("");
    const [allInsulinType, setallInsulinType] = useState<InsulinType[]>([]);
    const [newInsulinType, setNewInsulinType] = useState("");
    const { data, setData } = props;

    const changeInsulinType = (event: { target: { value: string } }) => {
        const insulinTypeInput = event.target.value;
        setInsulinType(insulinTypeInput);
    };

    const changeNewInsulinType = (event: { target: { value: string } }) => {
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
                    (obj) =>
                        obj.name.toLowerCase() === newInsulinType.toLowerCase()
                )
            ) {
                const response = await axios.post("/api/insulin-type/add", {
                    name: newInsulinType,
                });
                notify(response.data.message, "success");
                setNewInsulinType("");
                setallInsulinType((data) => [...data, response.data.entry]);

                const addResponse = await axios.post("/api/users/add-insulin", {
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
                    (obj) =>
                        obj.name.toLowerCase() === insulinType.toLowerCase()
                )
            ) {
                const response = await axios.post("/api/users/add-insulin", {
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
            const reponse = await axios.get("/api/insulin-type/get");
            let sortedData = sortData(reponse.data.data);
            setallInsulinType(sortedData);
        };
        getAllInsulinTypes();
    }, []);

    return (
        <div className="space-y-5">
            <form onSubmit={submitUserInsulin}>
                <Field label="Add insulin to your profile" htmlFor="insulinType">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <SelectInput
                            id="insulinType"
                            value={insulinType}
                            onChange={changeInsulinType}
                            shellClassName="flex-1"
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
                        </SelectInput>
                        <AppButton type="submit" size="field">
                            Add
                        </AppButton>
                    </div>
                </Field>
            </form>
            <form onSubmit={submitNewInsulin}>
                <Field label="Add new insulin (if not available)" htmlFor="newInsulinType">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <TextInput
                            type="text"
                            id="newInsulinType"
                            placeholder="Actrapid"
                            value={newInsulinType}
                            onChange={changeNewInsulinType}
                            shellClassName="flex-1"
                            required
                        />
                        <AppButton type="submit" size="field" variant="secondary">
                            Create
                        </AppButton>
                    </div>
                </Field>
            </form>
        </div>
    );
}
