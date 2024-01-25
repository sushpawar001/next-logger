import React from 'react'
import GlucoseAdd from '@/components/GlucoseAdd'
import InsulinAdd from '@/components/InsulinAdd'
import WeightAdd from '@/components/WeightAdd'
import GlucoseChart from '@/components/GlucoseChart'
import WeightChart from '@/components/WeightChart'

export default function Dashboard() {
    return (
        <div className='h-full flex justify-center items-center bg-background py-5 px-5 md:px-20'>
            <div className='w-full md:w-fit grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5'>
                <div className='col-span-1 '>
                    <div className='w-full'>
                        <div className='mb-3 md:mb-5 mx-auto p-4 md:px-6 rounded-xl bg-white shadow-md'>
                            <h3 className='block p-0 text-sm font-medium text-secondary'>Glucose history</h3>
                            <div>
                                <GlucoseChart />
                            </div>
                        </div>
                        <div className='mx-auto p-4 md:px-6 rounded-xl bg-white shadow-md'>
                            <h3 className='block text-sm font-medium text-secondary'>Weight history</h3>
                            <div>
                                <WeightChart />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-span-1'>
                    <div className='w-full'>
                        <div className='mb-4 md:mb-6'>
                            <GlucoseAdd />
                        </div>
                        <div className='mb-4 md:mb-6'>
                            <InsulinAdd />
                        </div>
                        <div>
                            <WeightAdd />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
