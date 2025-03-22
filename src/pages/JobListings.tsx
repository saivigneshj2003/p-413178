
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JobList } from "@/components/features/JobList";

const JobListings = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Header />
      <main className="flex flex-col flex-1 px-6 py-8">
        <JobList />
      </main>
      <Footer />
    </div>
  );
};

export default JobListings;
