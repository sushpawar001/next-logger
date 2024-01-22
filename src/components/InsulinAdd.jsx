'use client';
import React, { useState } from 'react'
import notify from '@/helpers/notify';
import axios from 'axios';

export default function InsulinAdd(props) {
    const [insulin, setInsulin] = useState('')
    const [insulinType, setInsulinType] = useState('')
    const changeInsulin = (event) => {
        const insulinInput = event.target.value
        setInsulin(insulinInput)
    }

    const changeInsulinType = (event) => {
        const insulinTypeInput = event.target.value
        setInsulinType(insulinTypeInput)
    }

    const submitForm = async (e) => {
        e.preventDefault()
        console.log(insulin)
        try {
            const response = await axios.post('/api/insulin/add/', { units: insulin, name: insulinType })
            console.log(response);
            notify(response.data.message, 'success')
            setInsulinType('')
            setInsulin('')

            // if (props.data && props.setData) {
            //     props.setData((prevData) => [...prevData, response.data.entry]);
            // }

            if (props.data && props.setData) {
                // Assuming response.data.entry has a 'date' property
                const newEntry = response.data.entry;

                props.setData((prevData) => {
                    // Combine the new entry with the existing data
                    const newData = [newEntry, ...prevData];

                    // Sort the array based on the 'date' property
                    newData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    return newData;
                });
            }


        } catch (error) {
            notify(error.response.data.message, 'error')
        }
    }
    return (
        <form className="max-w-full mx-auto p-5 md:p-7 rounded-md bg-white shadow-md" onSubmit={submitForm}>
                <label htmlFor="insulin" className="block mb-2 text-sm font-medium text-gray-900">Insulin Dose (units)</label>
                <div className='flex flex-col md:flex-row gap-3'>
                    <input type="number" id="insulin"
                        className="bg-gray-50 border border-stone-400 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                        placeholder="10 IU"
                        value={insulin}
                        onChange={changeInsulin}
                        required />

                    <select id="insulinType" value={insulinType} onChange={changeInsulinType}
                        className="bg-gray-50 border border-stone-400 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 invalid:text-gray-400" required>
                        <option value="" disabled>Select Type</option>
                        <option>Actrapid</option>
                        <option>Lantus</option>
                    </select>
                    <button type="submit" className="text-white bg-cyan-600 hover:bg-cyan-800 focus:ring-4 focus:outline-none focus:ring-cyan-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">Submit</button>
                </div>

        </form>
    )
}
