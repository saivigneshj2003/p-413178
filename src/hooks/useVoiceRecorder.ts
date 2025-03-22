
import { useState, useRef } from "react";

interface UseVoiceRecorderOptions {
  onRecordingComplete: (audioBlob: Blob) => void;
}

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  message: string;
  subMessage: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export const useVoiceRecorder = ({
  onRecordingComplete,
}: UseVoiceRecorderOptions): UseVoiceRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState("Voice Assistant Ready");
  const [subMessage, setSubMessage] = useState("Say \"Hey Assistant\" or tap the microphone to start");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setMessage("Listening...");
      setSubMessage("Speak now. Click again to stop recording.");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      // Use audio/wav MIME type with proper codec
      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100); // Collect data in 100ms chunks
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      setMessage("Microphone Access Denied");
      setSubMessage("Please allow microphone access and try again");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Create a handler for the stop event
      mediaRecorderRef.current.onstop = () => {
        // Stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        
        // Create a blob with the audio data
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Call the callback with the audio blob
        onRecordingComplete(audioBlob);
      };
      
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    message,
    subMessage,
    startRecording,
    stopRecording
  };
};
