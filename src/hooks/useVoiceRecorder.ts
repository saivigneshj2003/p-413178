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

      // Try different MIME types in order of preference
      const mimeTypes = [
        'audio/wav',
        'audio/webm;codecs=pcm',
        'audio/webm'
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error('No supported audio MIME type found');
      }

      const options = { 
        mimeType: selectedMimeType,
        audioBitsPerSecond: 16000
      };
      
      console.log('Using MIME type:', selectedMimeType);
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

  const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async () => {
        try {
          const arrayBuffer = fileReader.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Create WAV file
          const wavBuffer = audioBufferToWav(audioBuffer);
          const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
          resolve(wavBlob);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(fileReader.error);
      fileReader.readAsArrayBuffer(audioBlob);
    });
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const data = new Float32Array(buffer.length * numChannels);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        data[i * numChannels + channel] = channelData[i];
      }
    }
    
    const dataSize = data.length * bytesPerSample;
    const buffer_ = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer_);
    
    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Write audio data
    const samples = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    for (let i = 0; i < samples.length; i++) {
      view.setInt16(44 + i * 2, samples[i], true);
    }
    
    return buffer_;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setMessage("Processing...");
      setSubMessage("Please wait while we process your recording");
      
      mediaRecorderRef.current.stop();
      
      // Create a handler for the stop event
      mediaRecorderRef.current.onstop = async () => {
        try {
          // Stop all tracks
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
          
          // Create a blob with the audio data
          const initialBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
          
          // Convert to WAV if not already in WAV format
          const audioBlob = initialBlob.type === 'audio/wav' ? initialBlob : await convertToWav(initialBlob);
          
          // Call the completion handler with the audio blob
          onRecordingComplete(audioBlob);
        } catch (error) {
          console.error('Error processing recording:', error);
          setMessage("Error Processing Recording");
          setSubMessage("Please try again");
        }
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
