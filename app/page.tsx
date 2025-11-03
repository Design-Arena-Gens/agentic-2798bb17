"use client";

import { useState, useRef, useEffect } from "react";
import CameraControls from "./components/CameraControls";
import ImageStack from "./components/ImageStack";
import StackedPreview from "./components/StackedPreview";

export default function Home() {
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [activeTab, setActiveTab] = useState<"camera" | "stack">("camera");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    initCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Unable to access camera. Please grant camera permissions.");
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL("image/png");
      setCapturedImages(prev => [...prev, imageData]);
    }
  };

  const startBurstCapture = async (count: number, interval: number) => {
    setIsCapturing(true);
    for (let i = 0; i < count; i++) {
      captureImage();
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    setIsCapturing(false);
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setCapturedImages([]);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AstroCamera
        </h1>
        <p className="text-xs text-center text-gray-400 mt-1">
          Professional Astrophotography Stacking
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-900 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("camera")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === "camera"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          📷 Camera ({capturedImages.length})
        </button>
        <button
          onClick={() => setActiveTab("stack")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === "stack"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          🌟 Stack & Process
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "camera" ? (
          <div className="flex flex-col h-full">
            {/* Video Preview */}
            <div className="relative bg-black aspect-video max-h-[50vh]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isCapturing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-xl font-bold animate-pulse">
                    📸 Capturing...
                  </div>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/70 px-3 py-1 rounded-full text-xs">
                {capturedImages.length} frames
              </div>
            </div>

            {/* Camera Controls */}
            <CameraControls
              onCapture={captureImage}
              onBurstCapture={startBurstCapture}
              isCapturing={isCapturing}
              capturedCount={capturedImages.length}
            />

            {/* Thumbnails */}
            {capturedImages.length > 0 && (
              <div className="p-4 bg-gray-800/50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold">Captured Frames</h3>
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {capturedImages.map((img, idx) => (
                    <div key={idx} className="relative flex-shrink-0">
                      <img
                        src={img}
                        alt={`Frame ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border-2 border-gray-700"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1 -right-1 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            {capturedImages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📷</div>
                <p>No images captured yet</p>
                <p className="text-sm mt-2">Switch to Camera tab to start capturing</p>
              </div>
            ) : (
              <div className="space-y-6">
                <ImageStack images={capturedImages} />
                <StackedPreview images={capturedImages} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
