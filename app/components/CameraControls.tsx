"use client";

import { useState } from "react";

interface CameraControlsProps {
  onCapture: () => void;
  onBurstCapture: (count: number, interval: number) => void;
  isCapturing: boolean;
  capturedCount: number;
}

export default function CameraControls({
  onCapture,
  onBurstCapture,
  isCapturing,
  capturedCount
}: CameraControlsProps) {
  const [burstCount, setBurstCount] = useState(10);
  const [burstInterval, setBurstInterval] = useState(1000);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-gray-900 border-t border-gray-800 p-4 space-y-4">
      {/* Primary Capture Button */}
      <button
        onClick={onCapture}
        disabled={isCapturing}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-bold text-lg transition-colors"
      >
        {isCapturing ? "⏳ Capturing..." : "📸 Capture Frame"}
      </button>

      {/* Quick Burst Presets */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onBurstCapture(5, 1000)}
          disabled={isCapturing}
          className="py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-semibold transition-colors"
        >
          🚀 5 Burst<br/>
          <span className="text-xs opacity-80">1s interval</span>
        </button>
        <button
          onClick={() => onBurstCapture(10, 500)}
          disabled={isCapturing}
          className="py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-semibold transition-colors"
        >
          ⚡ 10 Burst<br/>
          <span className="text-xs opacity-80">0.5s interval</span>
        </button>
        <button
          onClick={() => onBurstCapture(20, 2000)}
          disabled={isCapturing}
          className="py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-semibold transition-colors"
        >
          🌙 20 Burst<br/>
          <span className="text-xs opacity-80">2s interval</span>
        </button>
      </div>

      {/* Advanced Controls Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        {showAdvanced ? "▼" : "▶"} Advanced Controls
      </button>

      {showAdvanced && (
        <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg">
          {/* Burst Count Slider */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Burst Count: {burstCount} frames
            </label>
            <input
              type="range"
              min="2"
              max="50"
              value={burstCount}
              onChange={(e) => setBurstCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2</span>
              <span>50</span>
            </div>
          </div>

          {/* Interval Slider */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Interval: {burstInterval}ms ({(burstInterval / 1000).toFixed(1)}s)
            </label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={burstInterval}
              onChange={(e) => setBurstInterval(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.1s</span>
              <span>5s</span>
            </div>
          </div>

          {/* Custom Burst Button */}
          <button
            onClick={() => onBurstCapture(burstCount, burstInterval)}
            disabled={isCapturing}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-bold transition-colors"
          >
            🎯 Custom Burst ({burstCount} × {(burstInterval / 1000).toFixed(1)}s)
          </button>

          {/* Info */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>💡 <strong>Tip:</strong> Use shorter intervals for bright objects (Moon, planets)</p>
            <p>💡 Use longer intervals for deep sky objects (galaxies, nebulae)</p>
            <p>💡 More frames = better noise reduction in final stack</p>
          </div>
        </div>
      )}
    </div>
  );
}
