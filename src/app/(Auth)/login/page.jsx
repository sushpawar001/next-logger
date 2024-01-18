'use client';
import notify from '@/helpers/notify';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

export default function LogIn() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/users/login/', formData)
            // console.log(response)
            if (response.status === 200) {
                notify('Login Successful!', 'success')
                router.push('/')
                router.refresh()
            }
        } catch (error) {
            console.log('error: ', error)
            notify(error.response.data.error, 'error')
        }

    };
    return (
        <div className='flex h-full justify-center items-center bg-stone-100 py-10 px-8 md:px-20'>
            <div className="mx-auto w-full max-w-lg rounded-md bg-white px-10 py-16 text-center shadow-md">
                <div className="mb-6 text-3xl font-bold">
                    <h1>Login</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <input
                            type='email'
                            placeholder='Enter your email address'
                            name='email'
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-cyan focus-visible:shadow-none dark:border-dark-3 dark:text-white"
                        />
                    </div>
                    <div className="mb-6">
                        <input
                            type='password'
                            placeholder='Enter password'
                            name='password'
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-cyan focus-visible:shadow-none dark:border-dark-3 dark:text-white"
                        />
                    </div>
                    <button type="submit" className="text-white bg-cyan-600 hover:bg-cyan-800 focus:ring-4 focus:outline-none focus:ring-cyan-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-cyan-600 dark:hover:bg-cyan-600 dark:focus:ring-cyan-800">Login</button>
                </form>
            </div>
        </div>
    );
};
