import React from 'react';
import { Button } from "@/components/ui/button";

interface JobPosition {
  title: string;
  company: string;
  location: string;
  type: string;
  skills: string[];
}

interface ResponseSectionProps {
  response: {
    status: string;
    speech_text?: string | null;
    error?: string | null;
    agent_response?: {
      status: string;
      job_positions?: JobPosition[];
      response?: string;
    } | null;
    steps?: Array<{
      step: string;
      status: string;
      text?: string;
      response?: string;
      message?: string;
    }>;
  } | null;
}

export const ResponseSection: React.FC<ResponseSectionProps> = ({ response }) => {
  if (!response) return null;

  const formatResponse = (text: string) => {
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;
      
      // Remove markdown list markers and clean up the line
      const cleanedLine = trimmedLine.replace(/^[-*]\s*/, '');
      
      return (
        <li key={index} className="py-1.5 flex items-start">
          <span className="inline-block w-2 h-2 mt-2 mr-2 bg-blue-500 rounded-full"></span>
          <span>{cleanedLine}</span>
        </li>
      );
    }).filter(Boolean);
  };

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-lg mb-8">
      <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2 className="text-lg font-medium text-gray-900">Job Recommendations</h2>
        </div>
      </div>
      
      <div className="px-6 py-4 space-y-6">
        {response.speech_text && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Your Request</h3>
            <p className="text-gray-900">{response.speech_text}</p>
          </div>
        )}
        
        {response.agent_response?.job_positions ? (
          <div className="grid grid-cols-1 gap-6">
            {response.agent_response.job_positions.map((job, index) => (
              <div key={index} className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-700">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 10C20 16 12 22 12 22C12 22 4 16 4 10C4 7.87827 4.84285 5.84344 6.34315 4.34315C7.84344 2.84285 9.87827 2 12 2C14.1217 2 16.1566 2.84285 17.6569 4.34315C19.1571 5.84344 20 7.87827 20 10Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 13.2554C18.2207 14.3805 15.1827 15 12 15C8.8173 15 5.7793 14.3805 3 13.2554M16 6V4C16 3.44772 15.5523 3 15 3H9C8.44772 3 8 3.44772 8 4V6M12 12H12.01M3 8H21V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V8Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>{job.type}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
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
            ))}
          </div>
        ) : response.agent_response?.response ? (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Response</h3>
            <div className="text-gray-900">
              {formatResponse(response.agent_response.response)}
            </div>
          </div>
        ) : null}
        
        {response.error && (
          <div className="bg-red-50 border border-red-100 rounded-md p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{response.error}</p>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Status:</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            response.status === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {response.status}
          </span>
        </div>
      </div>
    </div>
  );
};
