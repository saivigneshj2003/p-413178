import React from "react";
import { useNavigate } from "react-router-dom";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { VoiceAssistantContainer } from "./voice/VoiceAssistantContainer";

export const VoiceAssistant = () => {
  const navigate = useNavigate();

  const handleRecordingComplete = (audioBlob: Blob) => {
    console.log("Recording complete, navigating with blob size:", audioBlob.size);
    
    // Navigate to jobs page with the audio blob and processing flag
    navigate('/jobs', { 
      state: { 
        audioBlob,
        isProcessing: true,
        timestamp: Date.now() // Add timestamp to force state change
      },
      replace: true // Replace the current route to prevent back navigation
    });
  };

  const { 
    isRecording, 
    message, 
    subMessage, 
    startRecording, 
    stopRecording 
  } = useVoiceRecorder({
    onRecordingComplete: handleRecordingComplete
  });

  const handleVoiceCommand = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <section className="flex justify-center items-center w-full h-[408px] bg-[linear-gradient(90deg,#4F46E5_0%,#7C3AED_100%)] px-20 py-12 max-md:px-10 max-sm:px-5">
      <VoiceAssistantContainer
        message={message}
        subMessage={subMessage}
        isRecording={isRecording}
        onAction={handleVoiceCommand}
      />
    </section>
  );
};
