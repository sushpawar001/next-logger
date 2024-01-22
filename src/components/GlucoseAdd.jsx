'use client';
import notify from '@/helpers/notify';
import axios from 'axios';
import React, { useState } from 'react'

export default function GlucoseAdd(props) {
    const [glucose, setGlucose] = useState('')
    const changeGlucose = (event) => {
        setGlucose(event.target.value)
    }

    const submitForm = async (e) => {
        e.preventDefault()
        console.log(glucose)
        try {
            const response = await axios.post('/api/glucose/add/', { value: glucose }, { withCredentials: true })
            console.log("response: [Add]", response);
            notify(response.data.message, 'success')
            setGlucose('')

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
            console.error(error);
            notify(error.response?.data?.message || 'An error occurred', 'error');
        }
    }
    return (
        <form className="max-w-full mx-auto p-5 md:p-7 rounded-md bg-white shadow-md" onSubmit={submitForm}>
                <label htmlFor="glucose" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Blood Glucose</label>
                <div className='flex flex-col md:flex-row gap-3'>
                    <input type="number" id="glucose"
                        className="bg-gray-50 border border-stone-400  text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 "
                        placeholder="98 mg/dl"
                        value={glucose}
                        onChange={changeGlucose}
                        required />
                    <button type="submit" className="text-white bg-cyan-600 hover:bg-cyan-800 focus:ring-4 focus:outline-none focus:ring-cyan-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ">Submit</button>
                </div>
        </form>

    )
}
