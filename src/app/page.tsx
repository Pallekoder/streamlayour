"use client";

import * as React from "react";
import Link from "next/link";
import { ViewWindowButton } from "@/components/view-window-button";
import { Volume2, VolumeX } from "lucide-react";
import { Header } from "@/components/header";
import type { LayoutItem } from "@/lib/types";

interface LayoutPreset {
  id: string;
  name: string;
  layout: LayoutItem[];
  createdAt: number;
}

interface WebcamDevice {
  deviceId: string;
  label: string;
}

export default function LayoutPage() {
  const [savedLayouts, setSavedLayouts] = React.useState<LayoutPreset[]>([]);
  const [currentLayout, setCurrentLayout] = React.useState<any[]>([]);
  const [casinoUrl, setCasinoUrl] = React.useState("");
  const [webcamUrl, setWebcamUrl] = React.useState("");
  const [isMuted, setIsMuted] = React.useState(false);
  const [extraScreenUrl, setExtraScreenUrl] = React.useState("");
  const [viewWindow, setViewWindow] = React.useState<Window | null>(null);
  const [volume, setVolume] = React.useState(100);
  const [webcamDevices, setWebcamDevices] = React.useState<WebcamDevice[]>([]);

  React.useEffect(() => {
    // Load saved layouts and current layout from localStorage
    const layouts = JSON.parse(localStorage.getItem("layoutPresets") || "[]");
    const current = JSON.parse(localStorage.getItem("currentLayout") || "[]");
    setSavedLayouts(layouts);
    setCurrentLayout(current);

    // Load webcam devices
    async function loadWebcams() {
      try {
        // First request permission to access media devices
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Then enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 8)}...`
          }));
        
        setWebcamDevices(videoDevices);
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    }

    loadWebcams();

    // Try to find existing view window
    const existingViewWindow = window.open("", "viewWindow");
    if (existingViewWindow && !existingViewWindow.closed) {
      setViewWindow(existingViewWindow);
    }
  }, []);

  const refreshViewWindow = () => {
    if (viewWindow && !viewWindow.closed) {
      viewWindow.location.reload();
    }
  };

  const handleSave = () => {
    // Update only browser URLs in the current layout
    const updatedLayout = currentLayout.map(item => {
      if (item.type === "browser") {
        return { ...item, url: casinoUrl };
      }
      return item;
    });

    // Save the updated layout
    setCurrentLayout(updatedLayout);
    localStorage.setItem("currentLayout", JSON.stringify(updatedLayout));
    localStorage.setItem("casinoUrl", casinoUrl);
    localStorage.setItem("webcamUrl", webcamUrl);
    localStorage.setItem("extraScreenUrl", extraScreenUrl);
    
    // Refresh the view to show the new URLs
    refreshViewWindow();
  };

  const handleLayoutSelect = (layout: LayoutPreset) => {
    // Update only browser URLs in the selected layout
    const savedCasinoUrl = localStorage.getItem("casinoUrl") || "";
    const savedWebcamUrl = localStorage.getItem("webcamUrl") || "";

    const updatedLayout = layout.layout.map(item => {
      if (item.type === "browser") {
        return { ...item, url: savedCasinoUrl };
      }
      if (item.type === "chat") {
        return { ...item, url: "https://www.twitch.tv/popout/chat" };
      }
      if (item.type === "camera") {
        return { ...item, deviceId: savedWebcamUrl };
      }
      return item;
    });

    localStorage.setItem("currentLayout", JSON.stringify(updatedLayout));
    localStorage.setItem("selectedLayout", layout.id);
    setCurrentLayout(updatedLayout);
    refreshViewWindow();
  };

  const toggleItemVisibility = (type: string, index: number) => {
    const updatedLayout = currentLayout.map(item => {
      if (item.type === type && item.i === `${type.toUpperCase()}-${index}`) {
        return { ...item, isVisible: !item.isVisible };
      }
      return item;
    });
    setCurrentLayout(updatedLayout);
    localStorage.setItem("currentLayout", JSON.stringify(updatedLayout));
    refreshViewWindow();
  };

  // Get counts of each type of item in current layout
  const getTypeCounts = () => {
    const counts: Record<string, number> = {};
    currentLayout.forEach(item => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return counts;
  };

  const typeCounts = getTypeCounts();

  return (
    <div className="min-h-screen bg-[#1a1b36] p-8">
      <div className="mx-auto max-w-7xl">
        <Header />

        <h2 className="mb-8 text-center text-2xl font-bold text-white">
          CONTROL YOUR LAYOUT HERE
        </h2>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-medium text-white">SELECT LAYOUT</h3>
              {savedLayouts.length === 0 ? (
                <p className="text-center text-gray-400">No saved layouts yet. Create one in Settings.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {savedLayouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => handleLayoutSelect(layout)}
                      className="flex flex-col items-start rounded-md bg-[#2e3054] p-4 text-white hover:bg-[#3d3f6d]"
                    >
                      <span className="mb-1 font-medium">{layout.name}</span>
                      <span className="text-sm text-gray-400">
                        {new Date(layout.createdAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-4 text-lg font-medium text-white">HIDE / SHOW</h3>
              <div className="grid grid-cols-2 gap-2">
                {/* Dynamic hide/show buttons for each type */}
                {typeCounts.browser > 0 && Array.from({ length: typeCounts.browser }).map((_, i) => (
                  <React.Fragment key={`browser-${i}`}>
                    <button 
                      onClick={() => toggleItemVisibility("browser", i)}
                      className="rounded-md bg-[#ff6b6b] px-4 py-2 text-white"
                    >
                      HIDE BROWSER {i + 1}
                    </button>
                    <button 
                      onClick={() => toggleItemVisibility("browser", i)}
                      className="rounded-md bg-[#b659ff] px-4 py-2 text-white"
                    >
                      SHOW BROWSER {i + 1}
                    </button>
                  </React.Fragment>
                ))}
                
                {typeCounts.chat > 0 && Array.from({ length: typeCounts.chat }).map((_, i) => (
                  <React.Fragment key={`chat-${i}`}>
                    <button 
                      onClick={() => toggleItemVisibility("chat", i)}
                      className="rounded-md bg-[#ff6b6b] px-4 py-2 text-white"
                    >
                      HIDE CHAT {i + 1}
                    </button>
                    <button 
                      onClick={() => toggleItemVisibility("chat", i)}
                      className="rounded-md bg-[#b659ff] px-4 py-2 text-white"
                    >
                      SHOW CHAT {i + 1}
                    </button>
                  </React.Fragment>
                ))}

                {typeCounts.camera > 0 && Array.from({ length: typeCounts.camera }).map((_, i) => (
                  <React.Fragment key={`camera-${i}`}>
                    <button 
                      onClick={() => toggleItemVisibility("camera", i)}
                      className="rounded-md bg-[#ff6b6b] px-4 py-2 text-white"
                    >
                      HIDE CAMERA {i + 1}
                    </button>
                    <button 
                      onClick={() => toggleItemVisibility("camera", i)}
                      className="rounded-md bg-[#b659ff] px-4 py-2 text-white"
                    >
                      SHOW CAMERA {i + 1}
                    </button>
                  </React.Fragment>
                ))}

                {typeCounts.ad > 0 && Array.from({ length: typeCounts.ad }).map((_, i) => (
                  <React.Fragment key={`ad-${i}`}>
                    <button 
                      onClick={() => toggleItemVisibility("ad", i)}
                      className="rounded-md bg-[#ff6b6b] px-4 py-2 text-white"
                    >
                      HIDE AD {i + 1}
                    </button>
                    <button 
                      onClick={() => toggleItemVisibility("ad", i)}
                      className="rounded-md bg-[#b659ff] px-4 py-2 text-white"
                    >
                      SHOW AD {i + 1}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Settings section */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-medium text-white">SETTINGS</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-white">SELECT CASINO</label>
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
                      value={casinoUrl}
                      onChange={(e) => setCasinoUrl(e.target.value)}
                    >
                      <option value="">Select Casino</option>
                      <option value="https://www.comeon.com">ComeOn</option>
                    </select>
                    <input
                      type="text"
                      value={casinoUrl}
                      onChange={(e) => setCasinoUrl(e.target.value)}
                      placeholder="https://www.comeon.com"
                      className="flex-[2] rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
                    />
                    <button 
                      onClick={handleSave}
                      className="rounded-md bg-[#b659ff] px-4 py-2 text-white"
                    >
                      SAVE
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white">SELECT WEBCAM</label>
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
                      value={webcamUrl}
                      onChange={(e) => setWebcamUrl(e.target.value)}
                    >
                      <option value="">Select Webcam</option>
                      {webcamDevices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={handleSave}
                      className="rounded-md bg-[#b659ff] px-4 py-2 text-white"
                    >
                      SAVE
                    </button>
                  </div>
        </div>

                <div>
                  <label className="mb-2 block text-sm text-white">AUDIO</label>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setIsMuted(true);
                          refreshViewWindow();
                        }}
                        className="flex-1 rounded-md bg-[#ff6b6b] px-4 py-2 text-white"
                      >
                        MUTE AUDIO
                      </button>
                      <button 
                        onClick={() => {
                          setIsMuted(false);
                          refreshViewWindow();
                        }}
                        className="flex-1 rounded-md bg-[#43b581] px-4 py-2 text-white"
                      >
                        UNMUTE AUDIO
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-white" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => {
                          setVolume(Number(e.target.value));
                          refreshViewWindow();
                        }}
                        className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-600"
                      />
                      <span className="text-sm text-white">{volume}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white">SELECT CASINO EXTRA SCREEN</label>
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
                      value={extraScreenUrl}
                      onChange={(e) => setExtraScreenUrl(e.target.value)}
                    >
                      <option value="">Select Casino</option>
                      <option value="comeon">ComeOn</option>
                    </select>
                    <input
                      type="text"
                      value={extraScreenUrl}
                      onChange={(e) => setExtraScreenUrl(e.target.value)}
                      placeholder="https://www.comeon.com/slots/starburst"
                      className="flex-[2] rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
                    />
                    <button 
                      onClick={handleSave}
                      className="rounded-md bg-[#b659ff] px-4 py-2 text-white"
                    >
                      SAVE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
