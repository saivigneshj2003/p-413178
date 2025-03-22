import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bookmark, MapPin, DollarSign } from "lucide-react";
import { ResponseSection } from "./ResponseSection";

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  salary: string;
  skills: string[];
  remote?: boolean;
}

const JobCard = ({ title, company, location, salary, skills, remote }: JobCardProps) => {
  return (
    <div className="bg-white rounded-lg border p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {title === "Senior Frontend Developer" ? (
            <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 18L22 12L16 6" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6L2 12L8 18" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ) : title === "Data Scientist" ? (
            <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H10V10H4V4Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 4H20V10H14V4Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 14H10V20H4V14Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 17C14 17.7956 14.3161 18.5587 14.8787 19.1213C15.4413 19.6839 16.2044 20 17 20C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17C20 16.2044 19.6839 15.4413 19.1213 14.8787C18.5587 14.3161 17.7956 14 17 14C16.2044 14 15.4413 14.3161 14.8787 14.8787C14.3161 15.4413 14 16.2044 14 17Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ) : (
            <div className="w-10 h-10 bg-amber-100 rounded-md flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 18H12.01M7 21H17C18.1046 21 19 20.1046 19 19V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{company}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-700">
          <Bookmark size={20} />
        </button>
      </div>

      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin size={16} />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <DollarSign size={16} />
          <span>{salary}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((skill, index) => (
          <span 
            key={index} 
            className={`px-3 py-1 text-xs rounded-full ${
              title === "Senior Frontend Developer" 
                ? "bg-blue-50 text-blue-700" 
                : title === "Data Scientist"
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Button className="bg-blue-600 hover:bg-blue-700">Apply Now</Button>
        <button className="text-gray-400 hover:text-gray-700">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6C10.5523 6 11 5.55228 11 5C11 4.44772 10.5523 4 10 4C9.44772 4 9 4.44772 9 5C9 5.55228 9.44772 6 10 6Z" fill="currentColor"/>
            <path d="M10 11C10.5523 11 11 10.5523 11 10C11 9.44772 10.5523 9 10 9C9.44772 9 9 9.44772 9 10C9 10.5523 9.44772 11 10 11Z" fill="currentColor"/>
            <path d="M10 16C10.5523 16 11 15.5523 11 15C11 14.4477 10.5523 14 10 14C9.44772 14 9 14.4477 9 15C9 15.5523 9.44772 16 10 16Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export const JobList = () => {
  const location = useLocation();
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const processAudio = async () => {
      const state = location.state as { audioBlob?: Blob; isProcessing?: boolean };
      if (state?.audioBlob && state.isProcessing) {
        setIsLoading(true);
        try {
          const formData = new FormData();
          formData.append('audio', state.audioBlob, 'recording.wav');

          const response = await fetch('http://localhost:3002/api/process-audio', {
            method: 'POST',
            body: formData
          });

          const data = await response.json();
          // Extract the result from the server response
          setResponse(data.result);
        } catch (error) {
          setResponse({
            status: 'error',
            error: 'Failed to process audio'
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    processAudio();
  }, [location]);

  const jobs = [
    {
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "Remote (US)",
      salary: "120K - 150K / year",
      skills: ["React", "TypeScript", "Next.js"],
      remote: true
    },
    {
      title: "Data Scientist",
      company: "DataCo Analytics",
      location: "New York, NY",
      salary: "130K - 160K / year",
      skills: ["Python", "ML", "TensorFlow"]
    },
    {
      title: "Mobile Developer",
      company: "AppWorks Solutions",
      location: "San Francisco, CA",
      salary: "110K - 140K / year",
      skills: ["Swift", "Kotlin", "Flutter"]
    }
  ];

  return (
    <div className="max-w-3xl mx-auto w-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-16 mb-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Processing audio...</span>
        </div>
      ) : (
        <ResponseSection response={response} />
      )}
      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job, index) => (
          <JobCard key={index} {...job} />
        ))}
      </div>
      <footer className="mt-8 text-center text-sm text-gray-500">
        2025 JobVoice. All rights reserved.
        <div className="flex justify-center mt-2 gap-4">
          <button className="text-gray-500 hover:text-gray-700">Support</button>
          <button className="text-gray-500 hover:text-gray-700">Settings</button>
        </div>
      </footer>
    </div>
  );
};
