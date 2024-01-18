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
            const entryData = await axios.get(`/api/weight/get-one/${params.entryId}`)
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
            const response = await axios.put(`/api/weight/update/${params.entryId}`, data)
            notify(response.data.message, 'success')
            router.push('/weight/');
        } catch (error) {
            console.log("Error [weight-update]: ", error)
            notify(error.response.data.message, 'error')
        }
    }

    return (
        <section className='h-full flex justify-center items-center bg-stone-100 p-5'>
            <div className='bg-white p-6 rounded-md shadow-md w-full max-w-md'>
                <h3 className='text-center mb-5 font-semibold text-lg text-gray-900'>Edit Weight:</h3>
                <form onSubmit={submitForm}>
                        <div className='flex flex-col gap-3'>
                            <div>
                                <label htmlFor="weightUpdate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Weight entry:</label>
                                <input type="number" id="weightUpdate"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
                                    value={data.value}
                                    onChange={changeValue}
                                    required />
                            </div>
                            <div>
                                <label htmlFor="weightDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Entry time:</label>
                                <input type="datetime-local" id="weightDate"
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
