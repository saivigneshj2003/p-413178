import React from 'react';

interface ResponseSectionProps {
  response: {
    status: string;
    speech_text?: string | null;
    error?: string | null;
    agent_response?: string | null;
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
        
        {response.agent_response && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Available Positions</h3>
            <ul className="space-y-1">
              {formatResponse(response.agent_response)}
            </ul>
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
