
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JobList } from "@/components/features/JobList";
import { VoiceProcessing } from "@/components/features/VoiceProcessing";
import { useLocation } from "react-router-dom";

const JobListings = () => {
  const location = useLocation();
  const isProcessing = location.state?.isProcessing || false;

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Header />
      <main className="flex flex-col flex-1">
        {isProcessing && <VoiceProcessing />}
        <div className="px-6 py-8">
          <JobList />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobListings;
