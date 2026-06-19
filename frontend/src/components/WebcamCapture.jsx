import { useRef } from "react";

function WebcamCapture() {
  const videoRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Camera Error:", error);
      alert("Unable to access camera");
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full rounded border"
      />

      <button
        onClick={startCamera}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Start Camera
      </button>
    </div>
  );
}

export default WebcamCapture;
