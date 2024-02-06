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
        <form className="max-w-full mx-auto p-5 md:p-7 rounded-xl bg-white shadow-md" onSubmit={submitForm}>
            <label htmlFor="weight" className="block mb-2 text-sm font-medium text-secondary dark:text-white">Your Body Weight (kg)</label>
            <div className='flex flex-col md:flex-row gap-2'>
                <input type="number" id="weight"
                    className="bg-gray-50 border border-stone-400 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5"
                    placeholder="72 kg"
                    value={weight}
                    onChange={changeWeight}
                    step='any'
                    required />
                <button type="submit" className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-xl text-sm w-full sm:w-auto px-5 py-2.5 text-center transition duration-300">Submit</button>
            </div>
        </form>

    )
}
