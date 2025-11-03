"use client";

interface ImageStackProps {
  images: string[];
}

export default function ImageStack({ images }: ImageStackProps) {
  const downloadImage = (src: string, index: number) => {
    const link = document.createElement("a");
    link.href = src;
    link.download = `astro-frame-${index + 1}.png`;
    link.click();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>📦</span> Image Stack Manager
      </h2>

      <div className="space-y-3">
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Stack Info</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-400 text-xs">Total Frames</div>
              <div className="text-xl font-bold text-blue-400">{images.length}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Status</div>
              <div className="text-sm font-semibold text-green-400">
                {images.length >= 5 ? "✓ Ready" : "⚠️ Need more"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-400 space-y-1">
            <p><strong className="text-white">Stacking Benefits:</strong></p>
            <p>• Reduces noise by averaging multiple exposures</p>
            <p>• Reveals faint details invisible in single frames</p>
            <p>• Improves signal-to-noise ratio (SNR)</p>
            <p>• Best results with 10+ aligned frames</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => images.forEach((img, idx) => downloadImage(img, idx))}
              className="py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              💾 Download All
            </button>
            <button
              onClick={() => {
                const canvas = document.createElement("canvas");
                const img = new Image();
                img.src = images[0];
                img.onload = () => {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const link = document.createElement("a");
                    link.href = canvas.toDataURL();
                    link.download = "astro-first-frame.png";
                    link.click();
                  }
                };
              }}
              className="py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              📸 Export First
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
