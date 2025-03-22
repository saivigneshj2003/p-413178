import React from "react";

export const Header = () => {
  return (
    <header className="flex w-full h-16 justify-center items-center bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-20 max-md:px-10 max-sm:px-5">
      <div className="flex w-full h-16 justify-between items-center px-4">
        <div className="flex items-center gap-8 max-md:gap-5">
          <div className="text-indigo-600 text-2xl">HR Portal</div>
          <nav className="flex items-center gap-[26.734px] max-md:hidden">
            <span className="text-gray-700 text-base">Dashboard</span>
            <span className="text-gray-700 text-base">Available Roles</span>
            <span className="text-gray-700 text-base">Applications</span>
            <span className="text-gray-700 text-base">Career Guidance</span>
          </nav>
        </div>
        <div className="relative w-8 h-8">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/d4c51ee463678d9c1c6b8fb67bfaaa025fa8da8b"
            alt="Profile"
            className="w-[32px] h-[32px] rounded-[9999px]"
          />
          <div className="absolute w-3 h-3 bg-emerald-500 rounded-full border-2 border-white right-0 bottom-0" />
        </div>
      </div>
    </header>
  );
};
