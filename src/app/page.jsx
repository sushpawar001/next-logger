import React from 'react'
import GlucoseAdd from '@/components/GlucoseAdd'
import InsulinAdd from '@/components/InsulinAdd'
import WeightAdd from '@/components/WeightAdd'
import GlucoseChart from '@/components/GlucoseChart'
import WeightChart from '@/components/WeightChart'

export default function Dashboard() {
    return (
        <div className='h-full flex justify-center items-center bg-stone-100 py-5 px-5 md:px-20'>
            <div className='w-full md:w-fit grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='col-span-1'>
                    <div className='w-full'>
                        <div className='mb-5 mx-auto px-5 md:px-10 py-5 rounded-md bg-white shadow-md'>
                            <h3 className='block p-0 text-sm font-medium text-gray-900'>Glucose history:</h3>
                            <div>
                                <GlucoseChart />
                            </div>
                        </div>
                        <div className='mx-auto px-5 md:px-10 py-5 rounded-md bg-white shadow-md'>
                        <h3 className='block text-sm font-medium text-gray-900'>Weight history:</h3>
                            <div>
                            <WeightChart />
                            </div>
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
