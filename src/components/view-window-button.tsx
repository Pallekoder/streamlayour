"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";

export function ViewWindowButton() {
  const openView = () => {
    window.open("/view", "_blank", "width=1920,height=1080");
  };

  return (
    <button
      onClick={openView}
      className="flex items-center gap-2 rounded-md bg-[#2e3054] px-4 py-2 text-white transition-colors hover:bg-[#3d3f6d]"
    >
      <ExternalLink className="h-4 w-4" />
      <span>Open View</span>
    </button>
  );
} 