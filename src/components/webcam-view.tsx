"use client";

import * as React from "react";

interface WebcamViewProps {
  deviceId?: string;
  className?: string;
}

export function WebcamView({ deviceId, className = "" }: WebcamViewProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    const currentVideoElement = videoRef.current;

    async function setupWebcam() {
      try {
        const constraints: MediaStreamConstraints = {
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (currentVideoElement) {
          currentVideoElement.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError('Failed to access webcam');
      }
    }

    setupWebcam();

    // Cleanup function to stop the webcam when component unmounts
    return () => {
      if (currentVideoElement?.srcObject) {
        const stream = currentVideoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [deviceId]);

  return (
    <div className={`relative flex h-full w-full items-center justify-center bg-black ${className}`}>
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
} 