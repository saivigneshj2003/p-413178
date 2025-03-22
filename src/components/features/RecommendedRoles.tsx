import React from "react";

const RoleCard = ({ title, matchPercentage, description }) => (
  <div className="bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-6 rounded-xl">
    <div className="flex justify-between items-center mb-4">
      <span className="text-black text-base">{title}</span>
      <span className="bg-emerald-100 text-emerald-700 text-sm px-3 py-[5px] rounded-full">
        {matchPercentage}% Match
      </span>
    </div>
    <p className="text-gray-600 text-sm mb-4">{description}</p>
    <div className="flex justify-between items-center">
      <span className="text-indigo-600 text-base">Learn More</span>
      <svg
        width="12"
        height="16"
        viewBox="0 0 12 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 1.5C0 0.671875 0.671875 0 1.5 0V1.5V13.7937L5.56563 10.8906C5.825 10.7031 6.17812 10.7031 6.4375 10.8906L10.5 13.7937V1.5H1.5V0H10.5C11.3281 0 12 0.671875 12 1.5V15.25C12 15.5312 11.8438 15.7875 11.5938 15.9156C11.3438 16.0437 11.0437 16.0219 10.8156 15.8594L6 12.4219L1.18438 15.8594C0.95625 16.0219 0.65625 16.0437 0.40625 15.9156C0.15625 15.7875 0 15.5312 0 15.25V1.5Z"
          fill="black"
        />
      </svg>
    </div>
  </div>
);

export const RecommendedRoles = () => {
  const roles = [
    {
      title: "Senior Product Designer",
      matchPercentage: 95,
      description: "Based on your UX/UI expertise and leadership potential",
    },
    {
      title: "UX Research Lead",
      matchPercentage: 88,
      description:
        "Aligned with your research background and analytical skills",
    },
    {
      title: "Design System Manager",
      matchPercentage: 82,
      description: "Perfect for your system thinking and documentation skills",
    },
  ];

  return (
    <section className="flex flex-col items-center w-full bg-gray-50 px-20 py-12 max-md:px-10 max-sm:px-5">
      <div className="w-full max-w-[1248px]">
        <div className="text-black text-center text-2xl mb-8">
          Recommended Roles
        </div>
        <div className="grid grid-cols-3 gap-6 max-md:grid-cols-2 max-sm:grid-cols-1">
          {roles.map((role, index) => (
            <RoleCard key={index} {...role} />
          ))}
        </div>
      </div>
    </section>
  );
};
