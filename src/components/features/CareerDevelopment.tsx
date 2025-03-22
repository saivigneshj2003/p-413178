import React from "react";

const SkillProgress = ({ skill, percentage }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between">
      <span className="text-black text-sm">{skill}</span>
      <span className="text-gray-500 text-sm">{percentage}%</span>
    </div>
    <div className="w-full h-2 bg-gray-200 rounded-full">
      <div
        className="h-full bg-indigo-600 rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const LearningPath = ({ title }) => (
  <div className="flex items-center gap-3">
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0C10.1217 0 12.1566 0.842855 13.6569 2.34315C15.1571 3.84344 16 5.87827 16 8C16 10.1217 15.1571 12.1566 13.6569 13.6569C12.1566 15.1571 10.1217 16 8 16C5.87827 16 3.84344 15.1571 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8ZM5.88438 4.59688C5.64687 4.72813 5.5 4.98125 5.5 5.25V10.75C5.5 11.0219 5.64687 11.2719 5.88438 11.4031C6.12188 11.5344 6.40938 11.5312 6.64375 11.3875L11.1438 8.6375C11.3656 8.5 11.5031 8.25937 11.5031 7.99687C11.5031 7.73438 11.3656 7.49375 11.1438 7.35625L6.64375 4.60625C6.4125 4.46562 6.12188 4.45937 5.88438 4.59062V4.59688Z"
        fill="black"
      />
    </svg>
    <span className="text-black text-base">{title}</span>
  </div>
);

export const CareerDevelopment = () => {
  const skills = [
    { skill: "UX Design", percentage: 90 },
    { skill: "User Research", percentage: 75 },
    { skill: "Leadership", percentage: 60 },
  ];

  const learningPaths = [
    "Advanced UX Research Methods",
    "Design Leadership Fundamentals",
    "Design Systems Architecture",
  ];

  return (
    <section className="flex justify-center items-center w-full bg-white px-20 py-12 max-md:px-10 max-sm:px-5">
      <div className="w-full max-w-4xl">
        <div className="text-black text-2xl mb-[34px]">
          Career Development Path
        </div>
        <div className="grid grid-cols-2 gap-8 max-sm:grid-cols-1">
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="text-black text-base mb-4">Skills Progress</div>
            <div className="flex flex-col gap-4">
              {skills.map((skill, index) => (
                <SkillProgress key={index} {...skill} />
              ))}
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="text-black text-base mb-4">
              Recommended Learning Paths
            </div>
            <div className="flex flex-col gap-4">
              {learningPaths.map((path, index) => (
                <LearningPath key={index} title={path} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
