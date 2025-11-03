"use client";

import { useState, useEffect, useRef } from "react";

interface StackedPreviewProps {
  images: string[];
}

export default function StackedPreview({ images }: StackedPreviewProps) {
  const [stackedImage, setStackedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stackMethod, setStackMethod] = useState<"average" | "median" | "maximum">("average");
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [saturation, setSaturation] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stackImages = async (method: "average" | "median" | "maximum") => {
    if (images.length === 0) return;

    setIsProcessing(true);
    setStackMethod(method);

    try {
      // Load all images
      const loadedImages = await Promise.all(
        images.map(src => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
          });
        })
      );

      const canvas = document.createElement("canvas");
      const firstImg = loadedImages[0];
      canvas.width = firstImg.width;
      canvas.height = firstImg.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) return;

      // Draw first image to get dimensions
      ctx.drawImage(firstImg, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Prepare pixel arrays for each position
      const pixelArrays: number[][][][] = [];
      for (let y = 0; y < canvas.height; y++) {
        pixelArrays[y] = [];
        for (let x = 0; x < canvas.width; x++) {
          pixelArrays[y][x] = [[], [], [], []]; // R, G, B, A channels
        }
      }

      // Collect pixel values from all images
      for (const img of loadedImages) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            pixelArrays[y][x][0].push(data[i]);     // R
            pixelArrays[y][x][1].push(data[i + 1]); // G
            pixelArrays[y][x][2].push(data[i + 2]); // B
            pixelArrays[y][x][3].push(data[i + 3]); // A
          }
        }
      }

      // Stack pixels based on method
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;

          for (let c = 0; c < 4; c++) {
            const values = pixelArrays[y][x][c];
            let result = 0;

            switch (method) {
              case "average":
                result = values.reduce((a, b) => a + b, 0) / values.length;
                break;
              case "median":
                values.sort((a, b) => a - b);
                const mid = Math.floor(values.length / 2);
                result = values.length % 2 === 0
                  ? (values[mid - 1] + values[mid]) / 2
                  : values[mid];
                break;
              case "maximum":
                result = Math.max(...values);
                break;
            }

            pixels[i + c] = result;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setStackedImage(canvas.toDataURL("image/png"));
    } catch (error) {
      console.error("Stacking error:", error);
      alert("Error stacking images");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (stackedImage && canvasRef.current) {
      applyAdjustments();
    }
  }, [brightness, contrast, saturation, stackedImage]);

  const applyAdjustments = () => {
    if (!stackedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
      ctx.drawImage(img, 0, 0);
    };
    img.src = stackedImage;
  };

  const downloadStacked = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = `astro-stacked-${stackMethod}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span>🌟</span> Stack & Process
      </h2>

      {/* Stack Method Selection */}
      <div>
        <label className="block text-sm font-semibold mb-2">Stacking Method</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => stackImages("average")}
            disabled={isProcessing || images.length === 0}
            className={`py-3 rounded-lg text-sm font-semibold transition-colors ${
              stackMethod === "average" && stackedImage
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 disabled:text-gray-600"
            }`}
          >
            📊 Average<br/>
            <span className="text-xs opacity-80">Balanced</span>
          </button>
          <button
            onClick={() => stackImages("median")}
            disabled={isProcessing || images.length === 0}
            className={`py-3 rounded-lg text-sm font-semibold transition-colors ${
              stackMethod === "median" && stackedImage
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 disabled:text-gray-600"
            }`}
          >
            🎯 Median<br/>
            <span className="text-xs opacity-80">Best quality</span>
          </button>
          <button
            onClick={() => stackImages("maximum")}
            disabled={isProcessing || images.length === 0}
            className={`py-3 rounded-lg text-sm font-semibold transition-colors ${
              stackMethod === "maximum" && stackedImage
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 disabled:text-gray-600"
            }`}
          >
            ⭐ Maximum<br/>
            <span className="text-xs opacity-80">Brightest</span>
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {stackMethod === "average" && "• Reduces noise by averaging all frames"}
          {stackMethod === "median" && "• Best for removing hot pixels and satellites"}
          {stackMethod === "maximum" && "• Preserves brightest details, good for stars"}
        </div>
      </div>

      {isProcessing && (
        <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 text-center">
          <div className="animate-pulse text-blue-400 font-semibold">
            ⚙️ Processing {images.length} frames...
          </div>
          <div className="text-xs text-gray-400 mt-1">This may take a moment</div>
        </div>
      )}

      {stackedImage && (
        <>
          {/* Preview */}
          <div className="bg-black rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
            />
          </div>

          {/* Adjustments */}
          <div className="space-y-3 bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-semibold">Image Adjustments</h3>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Brightness: {brightness.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Contrast: {contrast.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={contrast}
                onChange={(e) => setContrast(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Saturation: {saturation.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={saturation}
                onChange={(e) => setSaturation(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <button
              onClick={() => {
                setBrightness(1);
                setContrast(1);
                setSaturation(1);
              }}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              🔄 Reset Adjustments
            </button>
          </div>

          {/* Download */}
          <button
            onClick={downloadStacked}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors"
          >
            💾 Download Stacked Image
          </button>
        </>
      )}

      {!stackedImage && !isProcessing && images.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4 text-center text-gray-400 text-sm">
          Select a stacking method above to process your {images.length} frames
        </div>
      )}
    </div>
  );
}
