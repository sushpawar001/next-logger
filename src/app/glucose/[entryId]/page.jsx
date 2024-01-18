"use client"
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import notify from '@/helpers/notify'
import { DatetimeLocalFormat } from '@/helpers/formatDate';
import { useRouter } from 'next/navigation';

export default function EditEntry({ params }) {
    const [data, setData] = useState({ value: "", createdAt: "" })
    const router = useRouter();
    useEffect(() => {
        const getData = async () => {
            const entryData = await axios.get(`/api/glucose/get-one/${params.entryId}`)
            const entryCopy = entryData.data.data
            entryCopy.createdAt = DatetimeLocalFormat(entryCopy.createdAt)
            setData(entryCopy)
        }
        getData();
    }, [params.entryId])
    const changeValue = (event) => {
        setData({ ...data, value: event.target.value })
    }
    const changeDate = (event) => {
        setData({ ...data, createdAt: event.target.value })

    }

    const submitForm = async (e) => {
        e.preventDefault()
        try {
            data.createdAt = new Date(data.createdAt).toISOString()
            const response = await axios.put(`/api/glucose/update/${params.entryId}`, data)
            console.log(response);
            notify(response.data.message, 'success')
            router.push('/glucose/');
        } catch (error) {
            console.log(error)
            notify(error.response.data.message, 'error')
        }
    }

    return (
        <section className='h-full flex justify-center items-center bg-stone-100 p-5'>
            <div className='bg-white p-6 rounded-md shadow-md w-full max-w-md'>
                <form onSubmit={submitForm}>
                    <h3 className='text-center mb-5 font-semibold text-lg text-gray-900'>Edit insulin entry</h3>
                    <div className='flex flex-col gap-3'>
                        <div>
                            <label htmlFor="glucoseUpdate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Glucose Entry:</label>
                            <input type="number" id="glucoseUpdate"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
                                value={data.value}
                                onChange={changeValue}
                                required />
                        </div>

                        {/* <input type="text" id="glucoseDate"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
                                value={data.createdAt}
                                onChange={changeDate}
                                required /> */}
                        <div>
                            <label htmlFor="glucoseDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Entry Time:</label>
                            <input type="datetime-local" id="glucoseDate"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
                                value={data.createdAt}
                                onChange={changeDate}
                                required />
                        </div>
                        <button type="submit" className="text-white bg-cyan-600 hover:bg-cyan-800 focus:ring-4 focus:outline-none focus:ring-cyan-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-cyan-600 dark:hover:bg-cyan-600 dark:focus:ring-cyan-800">Submit</button>
                    </div>


                </form>
            </div>
        </section>
    )
}
