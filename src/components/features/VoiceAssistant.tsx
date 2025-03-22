
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export const VoiceAssistant = () => {
  const navigate = useNavigate();
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
        
        // Navigate to jobs page with the audio blob and processing flag
        navigate('/jobs', { 
          state: { 
            audioBlob: audioBlob,
            isProcessing: true
          }
        });
      };
      
      setIsRecording(false);
    }
  };

  const handleVoiceCommand = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <section className="flex justify-center items-center w-full h-[408px] bg-[linear-gradient(90deg,#4F46E5_0%,#7C3AED_100%)] px-20 py-12 max-md:px-10 max-sm:px-5">
      <div className="flex justify-center items-center w-full max-w-screen-md">
        <div className="w-full bg-[rgba(255,255,255,0.10)] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.10),0px_10px_15px_0px_rgba(0,0,0,0.10)] p-8 rounded-2xl">
          <div className="flex flex-col items-center gap-6">
            <div 
              className={`flex justify-center items-center w-20 h-20 ${isRecording ? 'bg-red-500' : 'bg-white'} shadow-[0px_4px_6px_0px_rgba(0,0,0,0.10),0px_10px_15px_0px_rgba(0,0,0,0.10)] rounded-full cursor-pointer transition-colors`}
              onClick={handleVoiceCommand}
            >
              <svg
                width="24"
                height="30"
                viewBox="0 0 24 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 0C8.89453 0 6.375 2.51953 6.375 5.625V15C6.375 18.1055 8.89453 20.625 12 20.625C15.1055 20.625 17.625 18.1055 17.625 15V5.625C17.625 2.51953 15.1055 0 12 0ZM4.5 12.6562C4.5 11.877 3.87305 11.25 3.09375 11.25C2.31445 11.25 1.6875 11.877 1.6875 12.6562V15C1.6875 20.2207 5.56641 24.5332 10.5938 25.2188V27.1875H7.78125C7.00195 27.1875 6.375 27.8145 6.375 28.5938C6.375 29.373 7.00195 30 7.78125 30H12H16.2188C16.998 30 17.625 29.373 17.625 28.5938C17.625 27.8145 16.998 27.1875 16.2188 27.1875H13.4062V25.2188C18.4336 24.5332 22.3125 20.2207 22.3125 15V12.6562C22.3125 11.877 21.6855 11.25 20.9062 11.25C20.127 11.25 19.5 11.877 19.5 12.6562V15C19.5 19.1426 16.1426 22.5 12 22.5C7.85742 22.5 4.5 19.1426 4.5 15V12.6562Z"
                  fill={isRecording ? "white" : "black"}
                />
              </svg>
            </div>
            <div className="text-white text-center text-2xl">
              {message}
            </div>
            <div className="text-[rgba(255,255,255,0.80)] text-center text-base whitespace-pre-line">
              {subMessage}
            </div>
            <button 
              className={`bg-white text-indigo-600 text-base px-6 py-3.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors`}
              onClick={handleVoiceCommand}
            >
              {isRecording ? "Stop Recording" : "Start Voice Command"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
