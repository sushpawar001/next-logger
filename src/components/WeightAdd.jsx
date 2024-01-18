'use client';
import notify from '@/helpers/notify';
import axios from 'axios';
import React, { useState } from 'react'

export default function WeightAdd(props) {
    const [weight, setWeight] = useState('')
    const changeWeight = (event) => {
        setWeight(event.target.value)
    }

    const submitForm = async (e) => {
        e.preventDefault()
        console.log(weight)
        try {
            const response = await axios.post('/api/weight/add/', { value: weight })
            notify(response.data.message, 'success')
            setWeight('')

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
        <form className="max-w-full mx-auto mb-5 px-10 py-5 rounded-md bg-white shadow-md" onSubmit={submitForm}>
            <div className="mb-4">
                <label htmlFor="weight" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Body Weight (kg)</label>
                <div className='flex flex-col md:flex-row gap-3'>
                    <input type="number" id="weight"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
                        placeholder="72 kg"
                        value={weight}
                        onChange={changeWeight}
                        required />
                    <button type="submit" className="text-white bg-cyan-600 hover:bg-cyan-800 focus:ring-4 focus:outline-none focus:ring-cyan-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-cyan-600 dark:hover:bg-cyan-600 dark:focus:ring-cyan-800">Submit</button>
                </div>
            </div>
        </form>

    )
}
