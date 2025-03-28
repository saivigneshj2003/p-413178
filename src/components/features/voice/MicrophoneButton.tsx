
import React from "react";

interface MicrophoneButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isRecording,
  onClick
}) => {
  return (
    <div 
      className={`flex justify-center items-center w-20 h-20 ${isRecording ? 'bg-red-500' : 'bg-white'} shadow-[0px_4px_6px_0px_rgba(0,0,0,0.10),0px_10px_15px_0px_rgba(0,0,0,0.10)] rounded-full cursor-pointer transition-colors`}
      onClick={onClick}
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
  );
};
