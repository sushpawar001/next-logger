import React from "react";

type InsulinType = {
    _id: string;
    name: string;
    createdAt: string;
};

export default function UserDetails(props: { data: InsulinType[] }) {
    const { data } = props;
    return (
        <div className="max-w-full h-full mx-auto p-5 md:p-7 rounded-lg bg-white shadow-md">
            <h2 className="block mb-2 text-base font-medium text-secondary">
                Your Insulins:
            </h2>
            <ol className="list-decimal list-inside">
                {data.map((insulins) => (
                    <li key={insulins._id} className="text-secondary text-base">
                        {insulins.name}
                    </li>
                ))}
            </ol>
        </div>
    );
}
