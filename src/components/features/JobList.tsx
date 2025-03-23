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
}

interface ServerResponse {
  message: string;
  result: {
    status: string;
    steps: Array<{
      step: string;
      status: string;
      text?: string;
      message?: string;
      response?: {
        status: string;
        job_positions: Array<{
          title: string;
          company: string;
          location: string;
          type: string;
          skills: string[];
        }>;
      };
    }>;
    error: string | null;
    speech_text: string;
    agent_response: {
      status: string;
      job_positions: Array<{
        title: string;
        company: string;
        location: string;
        type: string;
        skills: string[];
      }>;
    };
  };
}

const JobCard = ({ title, company, location, salary, skills}: JobCardProps) => {
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

      <div className="flex items-center gap-4 mb-4">
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
        {skills.map((skill, idx) => (
          <span key={idx} className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
            {skill}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <Button className="bg-blue-600 hover:bg-blue-700">Apply Now</Button>
      </div>
    </div>
  );
};

export const JobList = () => {
  const location = useLocation();
  const [response, setResponse] = useState<ServerResponse['result'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [showSampleJobs, setShowSampleJobs] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("Agent is thinking");
  const [loadingStep, setLoadingStep] = useState<number>(0);

  useEffect(() => {
    const processAudio = async () => {
      const state = location.state as { audioBlob?: Blob; isProcessing?: boolean };
      if (state?.audioBlob && state.isProcessing && !hasProcessed) {
        setIsLoading(true);
        setShowSampleJobs(false);
        
        // Start loading message sequence
        setLoadingMessage("Agent is thinking");
        setLoadingStep(0);

        try {
          const formData = new FormData();
          formData.append('audio', state.audioBlob, 'recording.wav');

          const serverResponse = await fetch('http://localhost:3002/api/process-audio', {
            method: 'POST',
            body: formData
          });

          if (!serverResponse.ok) {
            throw new Error('Server responded with an error');
          }

          const data: ServerResponse = await serverResponse.json();
          console.log('Server response:', JSON.stringify(data, null, 2));

          // Handle the wrapped response structure
          if (data?.message === 'Audio processed successfully' && data?.result) {
            setResponse(data.result);
            setShowSampleJobs(false);
            setIsLoading(false); // Reset loading state
          } else {
            console.error('Invalid response format:', data);
            setResponse(null);
            setShowSampleJobs(true);
            setIsLoading(false); // Reset loading state
          }
          setHasProcessed(true);
        } catch (error) {
          console.error('Error processing audio:', error);
          setResponse({
            status: 'error',
            steps: [],
            error: 'Failed to process audio: ' + (error instanceof Error ? error.message : String(error)),
            speech_text: '',
            agent_response: {
              status: 'error',
              job_positions: []
            }
          });
          setShowSampleJobs(true);
          setIsLoading(false); // Reset loading state
        }
      }
    };

    processAudio();
  }, [location.state, hasProcessed]);

  // Update loading message sequence
  useEffect(() => {
    if (isLoading) {
      const messages = [
        "Agent is thinking",
        "Agent is thinking even more",
        "Agent is thinking even even more",
        "It is trying to find best possible match",
        "It getting closer",
        "It found the best possible match"
      ];

      const interval = setInterval(() => {
        setLoadingStep((prevStep) => {
          if (prevStep >= messages.length - 1) {
            return prevStep;
          }
          setLoadingMessage(messages[prevStep + 1]);
          return prevStep + 1;
        });
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

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
          <span className="ml-3 text-gray-600">{loadingMessage}</span>
        </div>
      ) : response && response.status === 'success' ? (
        <ResponseSection response={response} />
      ) : null}
      
      {showSampleJobs && !isLoading && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-6">Sample Job Listings</h2>
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job, index) => (
              <JobCard key={index} {...job} />
            ))}
          </div>
        </div>
      )}
      
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
