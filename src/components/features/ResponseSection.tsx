import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign } from 'react-feather';

interface JobPosition {
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  skills: string | string[];
}

interface AgentResponse {
  status: string;
  response?: string | any;
  job_positions?: JobPosition[];
  message?: string;
}

interface ServerResponse {
  status: string;
  steps: Array<{
    step: string;
    status: string;
    text?: string;
    message?: string;
    response?: AgentResponse;
  }>;
  error: string | null;
  speech_text: string;
  agent_response: AgentResponse;
}

interface ResponseSectionProps {
  response: ServerResponse;
}

export const ResponseSection: React.FC<ResponseSectionProps> = ({ response }) => {
  // For debugging
  console.log('ResponseSection received:', JSON.stringify(response, null, 2));
  
  // Return null if response is not valid
  if (!response || response.status !== 'success' || !response.agent_response) {
    console.log('Invalid response in ResponseSection:', response);
    return null;
  }

  const formatResponse = (text: string) => {
    if (!text) return [];
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

  // Helper function to clean job title
  const cleanJobTitle = (title: string) => {
    // Remove JSON formatting artifacts
    return title
      .replace(/^"title":\s*"|",$/, '') // Remove "title": " and ",
      .replace(/^"/, '')  // Remove leading quote
      .replace(/"$/, '')  // Remove trailing quote
      .replace(/\\"/g, '"'); // Replace escaped quotes
  };

  // Helper function to clean text fields
  const cleanField = (field: string): string => {
    if (!field) return '';
    
    // Remove metadata formatting
    return field
      .replace(/^(location|type|salary)\":\s*\"/, '')
      .replace(/\\"/g, '')
      .replace(/\"$/, '')
      .trim();
  };

  // Helper function to clean skills data
  const cleanSkills = (skills: string | string[]): string[] => {
    if (!skills) return [];
    
    // If skills is already an array
    if (Array.isArray(skills)) {
      // Filter out metadata-like entries
      return skills
        .filter(skill => 
          !skill.includes('location\":') && 
          !skill.includes('type\":') && 
          !skill.includes('salary\":') && 
          !skill.includes('skills\":')
        )
        .map(skill => skill.replace(/\\"/g, '').replace(/"/g, '').trim());
    }
    
    // If skills is a string
    return skills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => 
        !skill.includes('location\":') && 
        !skill.includes('type\":') && 
        !skill.includes('salary\":') && 
        !skill.includes('skills\":')
      );
  };

  // Helper function to determine if we have job positions to display
  const hasJobPositions = () => {
    // Check direct job_positions property
    if (response.agent_response?.job_positions && 
        Array.isArray(response.agent_response.job_positions) && 
        response.agent_response.job_positions.length > 0) {
      return true;
    }
    
    // Check if response is a string that contains job positions in JSON format
    if (typeof response.agent_response?.response === 'string') {
      const responseStr = response.agent_response.response.trim();
      // Check if the response contains a JSON array with job positions
      if (responseStr.includes('"title"') && 
          responseStr.includes('"location"') && 
          responseStr.includes('"skills"')) {
        try {
          // Try to extract the JSON array from the response string
          const jsonMatch = responseStr.match(/\[\s*\{.*\}\s*\]/s);
          if (jsonMatch) {
            const jsonStr = jsonMatch[0];
            const parsedPositions = JSON.parse(jsonStr);
            return Array.isArray(parsedPositions) && parsedPositions.length > 0;
          }
        } catch (error) {
          console.error("Error parsing job positions from response string:", error);
        }
      }
    }
    
    return false;
  };

  // Helper function to get the job positions array
  const getJobPositions = () => {
    // Check direct job_positions property
    if (response.agent_response?.job_positions && 
        Array.isArray(response.agent_response.job_positions)) {
      return response.agent_response.job_positions;
    }
    
    // Check if response is a string that contains job positions in JSON format
    if (typeof response.agent_response?.response === 'string') {
      const responseStr = response.agent_response.response.trim();
      // Check if the response contains a JSON array with job positions
      if (responseStr.includes('"title"') && 
          responseStr.includes('"location"') && 
          responseStr.includes('"skills"')) {
        try {
          // Try to extract the JSON array from the response string
          const jsonMatch = responseStr.match(/\[\s*\{.*\}\s*\]/s);
          if (jsonMatch) {
            const jsonStr = jsonMatch[0];
            const parsedPositions = JSON.parse(jsonStr);
            if (Array.isArray(parsedPositions)) {
              return parsedPositions;
            }
          }
        } catch (error) {
          console.error("Error parsing job positions from response string:", error);
        }
      }
    }
    
    return [];
  };

  // Helper function to check if we have a text response
  const hasTextResponse = () => {
    // If we have job positions, we don't need to show the text response
    if (hasJobPositions()) {
      return false;
    }
    
    return typeof response.agent_response?.response === 'string' && 
           response.agent_response.response.trim().length > 0;
  };

  // Helper function to get the text response
  const getTextResponse = () => {
    // If the response contains job positions as a JSON string, extract the message part
    if (typeof response.agent_response?.response === 'string') {
      const responseStr = response.agent_response.response.trim();
      if (responseStr.includes('"title"') && 
          responseStr.includes('"location"') && 
          responseStr.includes('"skills"')) {
        // Extract any message that might be before or after the JSON array
        const parts = responseStr.split(/\[\s*\{.*\}\s*\]/s);
        return parts.filter(part => part.trim().length > 0).join('\n\n');
      }
    }
    
    return response.agent_response?.response || '';
  };

  // Only render if we have valid job positions or a response message
  if (!hasJobPositions() && !hasTextResponse() && !response.agent_response?.response?.message) {
    console.log('No job positions or response message found');
    return null;
  }

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-lg mb-8">
      <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2 className="text-lg font-medium text-gray-900">
            {hasJobPositions() ? "Job Recommendations" : "Agent Response"}
          </h2>
        </div>
      </div>
      
      <div className="px-6 py-4 space-y-6">
        {response.speech_text && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Your Request</h3>
            <p className="text-gray-900">{response.speech_text}</p>
          </div>
        )}
        
        {/* Display text response if available */}
        {hasTextResponse() && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-gray-800 whitespace-pre-line">{getTextResponse()}</p>
          </div>
        )}
        
        {hasJobPositions() && (
          <div className="grid grid-cols-1 gap-6">
            {getJobPositions()
              .filter(job => !job.title.includes('Based on your resume')) // Filter out the introduction message
              .map((job, index) => (
              <div key={index} className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{cleanJobTitle(job.title)}</h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {job.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span>{cleanField(job.location)}</span>
                    </div>
                  )}
                  {job.type && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>{cleanField(job.type)}</span>
                    </div>
                  )}
                  {job.salary && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <DollarSign size={16} />
                      <span>{cleanField(job.salary)}</span>
                    </div>
                  )}
                </div>

                {job.skills && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {cleanSkills(job.skills).map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Apply Now</Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {response.agent_response?.response?.message && !hasJobPositions() && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Response</h3>
            <div className="text-gray-900">
              <ul className="list-none pl-0">
                {formatResponse(response.agent_response.response.message)}
              </ul>
            </div>
          </div>
        )}
        
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
