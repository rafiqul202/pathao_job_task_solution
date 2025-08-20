import { useState } from "react";

export default function ClothingColorChange() {
  // State for selected colors
  const [selectedTop, setSelectedTop] = useState("#ffffff");
  const [selectedBottom, setSelectedBottom] = useState("#ffffff");

  // Color options for clothing
  const colorOptions = [
    "#ff0000", // Red
    "#0000ff", // Blue
    "#ffff00", // Yellow
    "#00ff00", // Green
    "#ff00ff", // Pink
    "#808080", // Gray
    "#000000", // Black
    "#ffffff", // White
    "#ffa500", // Orange
    "#800080", // Purple
    "#8B0000", // Dark Red
    "#006400", // Dark Green
    "#00008B", // Dark Blue
    "#4B0082", // Indigo
    "#228B22", // Forest Green
    "#20B2AA", // Light Sea Green
    "#87CEEB", // Sky Blue
    "#4682B4", // Steel Blue
    "#9932CC", // Dark Orchid
    "#FF1493", // Deep Pink
    "#FF4500", // Orange Red
    "#FFD700", // Gold
    "#F0E68C", // Khaki
    "#F5DEB3", // Wheat
    "#D2B48C", // Tan
    "#A0522D", // Sienna
    "#8B4513", // Saddle Brown
    "#BC8F8F", // Rosy Brown``
    "#708090", // Slate Gray
    "#2F4F4F", // Dark Slate Gray
  ];

  // Drag and drop handlers
  const handleDragStart = (e, color) => {
    e.dataTransfer.setData("color", color);
  };

  const handleDropOnTop = (e) => {
    e.preventDefault();
    const color = e.dataTransfer.getData("color");
    setSelectedTop(color);
  };

  const handleDropOnBottom = (e) => {
    e.preventDefault();
    const color = e.dataTransfer.getData("color");
    setSelectedBottom(color);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-indigo-700">
        Dynamic Wardrobe
      </h1>

      <div className="flex flex-col md:flex-row w-full gap-8">
        {/* Color palette section */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Color Palette
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Drag colors to the outfit pieces
          </p>
          <div className="grid grid-cols-5 gap-2">
            {colorOptions.map((color) => (
              <div
                key={color}
                className="w-12 h-12 rounded-md shadow-sm cursor-move flex items-center justify-center"
                style={{ backgroundColor: color, border: "1px solid #ddd" }}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, color)}
              >
                {color === "#ffffff" && (
                  <span className="text-xs text-gray-400">White</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Outfit visualization section */}
        <div className="w-full md:w-2/3 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Outfit Preview
          </h2>
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64">
              {/* Outfit container - better positioning */}
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Top Section - accepts drag and drop */}
                <div
                  className="w-full flex items-center justify-center"
                  onDrop={handleDropOnTop}
                  onDragOver={allowDrop}
                >
                  {/* T-shirt */}
                  <svg viewBox="0 0 24 24" width="180" height="140">
                    <path
                      d="M16 2H8L6 6v3h2v13h8V9h2V6l-2-4z"
                      fill={selectedTop}
                      stroke="#333"
                      strokeWidth="0.2"
                    />
                  </svg>
                </div>
                <div
                  className="w-full flex items-center justify-center -mt-8"
                  onDrop={handleDropOnBottom}
                  onDragOver={allowDrop}
                >
                  <svg viewBox="0 0 200 200" width="120" height="140">
                    {/* Pants */}
                    <path
                      d="M60,20 L140,20 L150,180 L110,180 L100,100 L90,180 L50,180 L60,20 Z"
                      fill={selectedBottom}
                      stroke="#333"
                      strokeWidth="2"
                    />
                    {/* Waistband */}
                    <rect x="60" y="18" width="80" height="5" fill="#444" />
                    {/* Center seam */}
                    <path d="M100,20 L100,100" stroke="#000" strokeWidth="1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
