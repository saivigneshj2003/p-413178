
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LocationState {
  audioBlob?: Blob;
  isProcessing?: boolean;
}

export const VoiceProcessing = () => {
  const location = useLocation();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Please wait while we process your audio");
  const [errorDetails, setErrorDetails] = useState("");
  const state = location.state as LocationState || {};

  useEffect(() => {
    const processAudio = async () => {
      if (!state.audioBlob) {
        setStatus("error");
        setMessage("No audio data to process");
        return;
      }

      try {
        // Convert to WAV format using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const fileReader = new FileReader();
        
        fileReader.onload = async (event) => {
          try {
            if (!event.target?.result) {
              throw new Error("Failed to read audio file");
            }
            
            const arrayBuffer = event.target.result as ArrayBuffer;
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Create WAV file
            const wavBlob = await audioBufferToWav(audioBuffer);
            const audioFile = new File([wavBlob], "audiofile.wav", { type: 'audio/wav' });
            
            // Create FormData to send the file
            const formData = new FormData();
            formData.append('audio', audioFile);
            
            // Send the audio file to the server using the proxied endpoint
            const response = await fetch('/api/process-audio', {
              method: 'POST',
              body: formData
            });
            
            if (response.ok) {
              const result = await response.json();
              setStatus("success");
              
              if (result.result && result.result.speech_text) {
                setMessage(`You said: "${result.result.speech_text}"\n\nResponse: ${result.result.agent_response || "No response from agent"}`);
              } else {
                setMessage(result.result?.error || result.message || "Your request has been processed");
              }
            } else {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to process audio');
            }
          } catch (error) {
            console.error("Error processing audio data:", error);
            setStatus("error");
            setMessage("Processing Failed");
            setErrorDetails((error as Error).message || "There was an error processing your request");
          }
        };
        
        fileReader.onerror = () => {
          setStatus("error");
          setMessage("Processing Failed");
          setErrorDetails("Failed to read the audio file");
        };
        
        fileReader.readAsArrayBuffer(state.audioBlob);
      } catch (error) {
        console.error("Error processing audio:", error);
        setStatus("error");
        setMessage("Processing Failed");
        setErrorDetails((error as Error).message || "There was an error processing your request");
      }
    };

    if (state.isProcessing && state.audioBlob) {
      processAudio();
    } else if (!state.audioBlob) {
      setStatus("error");
      setMessage("No audio data available");
    }
  }, [state.audioBlob, state.isProcessing]);

  // Function to convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve) => {
      const numOfChan = buffer.numberOfChannels;
      const length = buffer.length * numOfChan * 2;
      const sampleRate = buffer.sampleRate;
      
      // Create the buffer for the WAV file
      const buffer16Bit = new ArrayBuffer(44 + length);
      const view = new DataView(buffer16Bit);
      
      // Write WAV header
      // "RIFF" chunk descriptor
      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + length, true);
      writeString(view, 8, 'WAVE');
      
      // "fmt " sub-chunk
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true); // fmt chunk size
      view.setUint16(20, 1, true); // audio format (1 for PCM)
      view.setUint16(22, numOfChan, true); // number of channels
      view.setUint32(24, sampleRate, true); // sample rate
      view.setUint32(28, sampleRate * numOfChan * 2, true); // byte rate
      view.setUint16(32, numOfChan * 2, true); // block align
      view.setUint16(34, 16, true); // bits per sample
      
      // "data" sub-chunk
      writeString(view, 36, 'data');
      view.setUint32(40, length, true); // data chunk size
      
      // Write the PCM samples
      const offset = 44;
      let pos = 44;
      
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const channel = buffer.getChannelData(i);
        
        for (let j = 0; j < channel.length; j++) {
          // Convert float audio data to 16-bit PCM
          const sample = Math.max(-1, Math.min(1, channel[j]));
          const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
          view.setInt16(pos, value, true);
          pos += 2;
        }
      }
      
      // Create Blob
      const wavBlob = new Blob([buffer16Bit], { type: 'audio/wav' });
      resolve(wavBlob);
    });
  };

  // Helper function to write strings to DataView
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "bg-white";
      case "success":
        return "bg-white";
      case "error":
        return "bg-white";
      default:
        return "bg-white";
    }
  };

  const getIconColor = () => {
    switch (status) {
      case "processing":
        return "white";
      case "success":
        return "white";
      case "error":
        return "white";
      default:
        return "white";
    }
  };

  return (
    <section className="flex justify-center items-center w-full h-[408px] bg-[linear-gradient(90deg,#4F46E5_0%,#7C3AED_100%)] px-20 py-12 max-md:px-10 max-sm:px-5">
      <div className="flex justify-center items-center w-full max-w-screen-md">
        <div className="w-full bg-[rgba(255,255,255,0.10)] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.10),0px_10px_15px_0px_rgba(0,0,0,0.10)] p-8 rounded-2xl">
          <div className="flex flex-col items-center gap-6">
            <div className={`flex justify-center items-center w-20 h-20 ${getStatusColor()} shadow-[0px_4px_6px_0px_rgba(0,0,0,0.10),0px_10px_15px_0px_rgba(0,0,0,0.10)] rounded-full`}>
              <svg
                width="24"
                height="30"
                viewBox="0 0 24 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 0C8.89453 0 6.375 2.51953 6.375 5.625V15C6.375 18.1055 8.89453 20.625 12 20.625C15.1055 20.625 17.625 18.1055 17.625 15V5.625C17.625 2.51953 15.1055 0 12 0ZM4.5 12.6562C4.5 11.877 3.87305 11.25 3.09375 11.25C2.31445 11.25 1.6875 11.877 1.6875 12.6562V15C1.6875 20.2207 5.56641 24.5332 10.5938 25.2188V27.1875H7.78125C7.00195 27.1875 6.375 27.8145 6.375 28.5938C6.375 29.373 7.00195 30 7.78125 30H12H16.2188C16.998 30 17.625 29.373 17.625 28.5938C17.625 27.8145 16.998 27.1875 16.2188 27.1875H13.4062V25.2188C18.4336 24.5332 22.3125 20.2207 22.3125 15V12.6562C22.3125 11.877 21.6855 11.25 20.9062 11.25C20.127 11.25 19.5 11.877 19.5 12.6562V15C19.5 19.1426 16.1426 22.5 12 22.5C7.85742 22.5 4.5 19.1426 4.5 15V12.6562Z"
                  fill="black"
                />
              </svg>
            </div>
            <div className="text-white text-center text-2xl">
              {status === "processing" ? "Processing..." : 
               status === "success" ? "Processing Complete" : 
               "Processing Failed"}
            </div>
            <div className="text-[rgba(255,255,255,0.80)] text-center text-base whitespace-pre-line">
              {message}
              {status === "error" && errorDetails && (
                <div className="mt-2 text-red-300">{errorDetails}</div>
              )}
            </div>
            <Button 
              className="bg-white text-indigo-600 hover:bg-gray-50"
              onClick={() => window.location.reload()}
            >
              Start Voice Command
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
