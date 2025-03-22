
import React from "react";
import { useNavigate } from "react-router-dom";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { VoiceAssistantContainer } from "./voice/VoiceAssistantContainer";

export const VoiceAssistant = () => {
  const navigate = useNavigate();

  const handleRecordingComplete = (audioBlob: Blob) => {
    navigate('/jobs', { 
      state: { 
        audioBlob: audioBlob,
        isProcessing: true
      }
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
