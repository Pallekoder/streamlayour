"use client";

import * as React from "react";
import { Monitor } from "lucide-react";

export function ViewWindowButton() {
  const handleDownloadApp = () => {
    // Link to your GitHub releases page or direct download link
    window.open('https://github.com/Pallekoder/streamlayour/releases/latest/download/Stream.Layout.View.Setup.exe', '_blank');
  };

  return (
    <button
      onClick={handleDownloadApp}
      className="flex items-center gap-2 rounded-md bg-[#43b581] px-4 py-2 text-white transition-colors hover:bg-[#3ca374]"
      title="Download the Stream Layout Viewer application"
    >
      <Monitor className="h-4 w-4" />
      <span>Download Viewer</span>
    </button>
  );
}