"use client";

import * as React from "react";
import GridLayout from "react-grid-layout";
import { GRID_COLS, GRID_ROW_HEIGHT, SCALE_FACTOR } from "@/lib/constants";
import { Background } from "@/components/background";
import { BrowserWindow } from "@/components/browser-window";
import { X } from "lucide-react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: "browser" | "chat" | "camera" | "ad";
  url?: string;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export default function ViewPage() {
  const [layout, setLayout] = React.useState<LayoutItem[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

  React.useEffect(() => {
    const savedLayout = localStorage.getItem("currentLayout");
    if (savedLayout) {
      setLayout(JSON.parse(savedLayout));
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleClose = () => {
    window.close();
  };

  const handleRefresh = () => {
    const savedLayout = localStorage.getItem("currentLayout");
    if (savedLayout) {
      setLayout(JSON.parse(savedLayout));
    }
  };

  // Scale up the row height from editor size to full size
  const fullSizeRowHeight = GRID_ROW_HEIGHT / SCALE_FACTOR;

  return (
    <div className="relative min-h-screen bg-background">
      <Background settings={JSON.parse(localStorage.getItem("backgroundSettings") || "{}")} />
      
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
        <button
          onClick={handleRefresh}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Refresh Layout
        </button>
        <button
          onClick={handleFullscreen}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
        <button
          onClick={handleClose}
          className="rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <GridLayout
        className="min-h-screen"
        layout={layout}
        cols={GRID_COLS}
        rowHeight={fullSizeRowHeight}
        width={windowSize.width}
        isDraggable={false}
        isResizable={false}
        margin={[0, 0]}
        containerPadding={[0, 0]}
        compactType={null}
      >
        {layout.map((item) => (
          <div key={item.i} className="overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            {item.type === "browser" && item.url && (
              <BrowserWindow 
                url={item.url} 
                onClose={() => {
                  const newLayout = layout.filter(l => l.i !== item.i);
                  setLayout(newLayout);
                  localStorage.setItem("currentLayout", JSON.stringify(newLayout));
                }}
              />
            )}
            {item.type === "chat" && item.url && (
              <iframe
                src={item.url}
                className="h-full w-full border-none"
                title="Chat"
              />
            )}
            {item.type === "camera" && item.url && (
              <iframe
                src={item.url}
                className="h-full w-full border-none"
                title="Camera"
                allow="camera;microphone"
              />
            )}
            {item.type === "ad" && item.url && (
              <iframe
                src={item.url}
                className="h-full w-full border-none"
                title="Advertisement"
              />
            )}
          </div>
        ))}
      </GridLayout>
    </div>
  );
} 