import React from "react";

export default function UserDetails(props) {
  const { data } = props;
  return (
    <div className="max-w-full h-full mx-auto p-5 md:p-7 rounded-xl bg-white shadow-md">
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
