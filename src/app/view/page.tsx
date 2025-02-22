"use client";

import * as React from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { GRID_COLS, GRID_ROW_HEIGHT } from "@/lib/constants";
import { BrowserWindow } from "@/components/browser-window";
import { WebcamView } from "@/components/webcam-view";

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: "browser" | "camera" | "chat" | "ad";
  url?: string;
  deviceId?: string;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  isVisible?: boolean;
  zIndex?: number;
}

interface BackgroundSettingsType {
  type: string;
  value: string;
  opacity: number;
}

export default function ViewPage() {
  const [layout, setLayout] = React.useState<LayoutItem[]>([]);
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });
  const [backgroundSettings, setBackgroundSettings] = React.useState<BackgroundSettingsType>({
    type: "color",
    value: "#1a1b36",
    opacity: 100
  });

  React.useEffect(() => {
    // Load layout and URLs from localStorage
    const loadLayout = () => {
      const savedLayout = localStorage.getItem("currentLayout");
      if (savedLayout) {
        const parsedLayout = JSON.parse(savedLayout);
        // Update URLs for each type
        const updatedLayout = parsedLayout.map((item: LayoutItem) => {
          if (item.type === "browser") {
            const url = localStorage.getItem("casinoUrl");
            if (url) {
              return { ...item, url };
            }
          }
          if (item.type === "chat") {
            // Keep the original URL if it exists
            if (item.url) {
              return item;
            }
            // Default to Twitch chat if no URL
            return { ...item, url: "https://www.twitch.tv/popout/chat" };
          }
          if (item.type === "camera") {
            const deviceId = localStorage.getItem("webcamUrl");
            return { ...item, deviceId };
          }
          return item;
        });
        setLayout(updatedLayout);
      }

      // Load background settings
      const savedBackground = localStorage.getItem("backgroundSettings");
      if (savedBackground) {
        setBackgroundSettings(JSON.parse(savedBackground));
      }
    };

    loadLayout();

    // Handle window resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Listen for storage changes to update layout in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (["currentLayout", "casinoUrl", "webcamUrl", "backgroundSettings"].includes(e.key || "")) {
        loadLayout();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Apply background styles
  const backgroundStyle = React.useMemo(() => {
    const opacity = backgroundSettings.opacity !== undefined ? backgroundSettings.opacity / 100 : 1;

    switch (backgroundSettings.type) {
      case "color":
        return {
          backgroundColor: backgroundSettings.value,
          opacity,
        };
      case "gradient":
        return {
          background: backgroundSettings.value,
          opacity,
        };
      case "image":
        return {
          backgroundImage: `url(${backgroundSettings.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity,
        };
      case "video":
        return {
          opacity,
        };
      default:
        return {};
    }
  }, [backgroundSettings]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      {backgroundSettings.type === "video" ? (
        <div className="absolute inset-0 -z-10 overflow-hidden" style={{ opacity: backgroundStyle.opacity }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          >
            <source src={backgroundSettings.value} />
          </video>
        </div>
      ) : (
        <div
          className="absolute inset-0 -z-10"
          style={backgroundStyle}
        />
      )}

      {/* Layout Grid */}
      <div className="h-screen w-screen">
        <GridLayout
          className="layout"
          layout={layout}
          cols={GRID_COLS}
          rowHeight={GRID_ROW_HEIGHT}
          width={windowSize.width}
          isDraggable={false}
          isResizable={false}
          margin={[0, 0]}
          containerPadding={[0, 0]}
          compactType={null}
          preventCollision={false}
        >
          {layout.map((item) => (
            item.isVisible !== false && (
              <div 
                key={item.i} 
                className="overflow-hidden rounded-md border border-border bg-background"
                style={{ zIndex: item.zIndex || 1 }}
              >
                {item.type === "browser" && item.url && (
                  <BrowserWindow 
                    url={item.url} 
                  />
                )}
                {item.type === "chat" && item.url && (
                  <iframe
                    src={item.url}
                    className="h-full w-full border-none"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-presentation"
                    title="Chat"
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      margin: 0,
                      padding: 0,
                      overflow: 'hidden'
                    }}
                  />
                )}
                {item.type === "camera" && item.deviceId && (
                  <WebcamView deviceId={item.deviceId} />
                )}
                {item.type === "ad" && item.url && (
                  <iframe
                    src={item.url}
                    className="h-full w-full border-none"
                    title="Advertisement"
                    style={{ pointerEvents: "none" }}
                  />
                )}
              </div>
            )
          ))}
        </GridLayout>
      </div>
    </div>
  );
} 