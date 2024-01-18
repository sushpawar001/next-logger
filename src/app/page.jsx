import React from 'react'
import GlucoseAdd from '../components/GlucoseAdd'
import WeightAdd from '../components/WeightAdd'
import InsulinAdd from '../components/InsulinAdd'
import GlucoseChart from '../components/GlucoseChart'
import WeightChart from '../components/WeightChart'

export default function Dashboard() {
    return (
        <div className='h-full flex justify-center items-center bg-stone-100 py-5 px-8 md:px-20'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='col-span-1'>
                    <div className='w-full'>
                        <div className='mb-6 mx-auto px-10 py-5 rounded-md bg-white shadow-md'>
                            <GlucoseChart />
                        </div>
                        <div className='mx-auto px-10 py-5 rounded-md bg-white shadow-md'>
                            <WeightChart />
                        </div>
                    </div>
                </div>
                <div className='col-span-1'>
                    <div className='w-full'>
                        <GlucoseAdd />
                        <InsulinAdd />
                        <WeightAdd />
                    </div>
                </div>
            </div>
        </div>
    )
}
