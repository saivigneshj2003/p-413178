
import React from "react";
import { Button } from "@/components/ui/button";
import { MicrophoneButton } from "./MicrophoneButton";

interface VoiceAssistantContainerProps {
  message: string;
  subMessage: string;
  isRecording: boolean;
  onAction: () => void;
}

export const VoiceAssistantContainer: React.FC<VoiceAssistantContainerProps> = ({
  message,
  subMessage,
  isRecording,
  onAction
}) => {
  return (
    <div className="flex justify-center items-center w-full max-w-screen-md">
      <div className="w-full bg-[rgba(255,255,255,0.10)] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.10),0px_10px_15px_0px_rgba(0,0,0,0.10)] p-8 rounded-2xl">
        <div className="flex flex-col items-center gap-6">
          <MicrophoneButton isRecording={isRecording} onClick={onAction} />
          <div className="text-white text-center text-2xl">
            {message}
          </div>
          <div className="text-[rgba(255,255,255,0.80)] text-center text-base whitespace-pre-line">
            {subMessage}
          </div>
          <button 
            className={`bg-white text-indigo-600 text-base px-6 py-3.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors`}
            onClick={onAction}
          >
            {isRecording ? "Stop Recording" : "Start Voice Command"}
          </button>
        </div>
      </div>
    </div>
  );
};
