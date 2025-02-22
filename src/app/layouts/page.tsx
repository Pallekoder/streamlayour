"use client";

import * as React from "react";
import { type Layout } from "react-grid-layout";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { 
  DEFAULT_SIZES, 
  GRID_COLS, 
  GRID_ROW_HEIGHT, 
  WINDOW_SETTINGS, 
  SCALE_FACTOR,
  MONITOR_WIDTH,
  MONITOR_HEIGHT 
} from "@/lib/constants";

// Calculate the editor dimensions that maintain the aspect ratio
const EDITOR_WIDTH = MONITOR_WIDTH * SCALE_FACTOR;
const EDITOR_HEIGHT = MONITOR_HEIGHT * SCALE_FACTOR;

// Calculate the scaled row height
const SCALED_ROW_HEIGHT = GRID_ROW_HEIGHT * SCALE_FACTOR;

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: "browser" | "camera" | "chat" | "ad";
  url?: string;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export default function LayoutsPage() {
  const [layout, setLayout] = React.useState<LayoutItem[]>([]);
  const [selectedType, setSelectedType] = React.useState<LayoutItem["type"]>("browser");
  const [insertUrl, setInsertUrl] = React.useState("");

  React.useEffect(() => {
    // Load saved layout on mount
    const savedLayout = localStorage.getItem("currentLayout");
    if (savedLayout) {
      setLayout(JSON.parse(savedLayout));
    }
  }, []);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout((prevLayout) =>
      prevLayout.map((item, index) => ({
        ...item,
        x: newLayout[index].x,
        y: newLayout[index].y,
        w: newLayout[index].w,
        h: newLayout[index].h,
      }))
    );
  };

  const addWindow = () => {
    const defaultSize = DEFAULT_SIZES[selectedType];
    const existingTypeCount = layout.filter(item => item.type === selectedType).length;
    
    // Position new items in a grid pattern
    const x = (existingTypeCount * defaultSize.w) % GRID_COLS;
    const y = Math.floor((existingTypeCount * defaultSize.w) / GRID_COLS) * defaultSize.h;

    const newItem: LayoutItem = {
      i: `${selectedType.toUpperCase()}-${existingTypeCount}`,
      x,
      y,
      w: defaultSize.w,
      h: defaultSize.h,
      type: selectedType,
      url: selectedType === "browser" ? "https://example.com" : undefined,
      minW: WINDOW_SETTINGS.minW,
      minH: WINDOW_SETTINGS.minH,
      maxW: WINDOW_SETTINGS.maxW,
      maxH: WINDOW_SETTINGS.maxH,
    };
    setLayout([...layout, newItem]);
  };

  const saveLayout = () => {
    localStorage.setItem("currentLayout", JSON.stringify(layout));
    // Also save to presets if needed
    const presets = JSON.parse(localStorage.getItem("layoutPresets") || "[]");
    const currentPreset = presets.find((p: { name: string }) => p.name === "Current Layout");
    if (currentPreset) {
      currentPreset.layout = layout;
    } else {
      presets.push({
        id: String(Date.now()),
        name: "Current Layout",
        layout,
      });
    }
    localStorage.setItem("layoutPresets", JSON.stringify(presets));
  };

  return (
    <div className="min-h-screen bg-[#1a1b36] p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-white">EDIT LAYOUT</h1>

        <div className="mb-8 grid grid-cols-3 gap-6">
          <div>
            <h2 className="mb-2 text-sm font-medium text-white">ADD NEW ITEM</h2>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as LayoutItem["type"])}
              className="mb-2 w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
            >
              <option value="browser">Screen</option>
              <option value="chat">Chat</option>
              <option value="camera">Camera</option>
              <option value="ad">Advertisement</option>
            </select>
            <button
              onClick={addWindow}
              className="w-full rounded-md bg-[#2e3054] px-4 py-2 text-white transition-colors hover:bg-[#3d3f6d]"
            >
              ADD
            </button>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-white">INSERT VIEW</h2>
            <input
              type="text"
              value={insertUrl}
              onChange={(e) => setInsertUrl(e.target.value)}
              className="mb-2 w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
              placeholder="Enter URL"
            />
            <button
              onClick={() => {
                if (insertUrl) {
                  const item = layout.find(i => i.i === selectedType);
                  if (item) {
                    setLayout(layout.map(i => 
                      i.i === selectedType ? { ...i, url: insertUrl } : i
                    ));
                  }
                  setInsertUrl("");
                }
              }}
              className="w-full rounded-md bg-[#2e3054] px-4 py-2 text-white transition-colors hover:bg-[#3d3f6d]"
            >
              INSERT
            </button>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-white">SAVE LAYOUT</h2>
            <button
              onClick={saveLayout}
              className="w-full rounded-md bg-[#b659ff] px-4 py-[34px] text-white transition-colors hover:bg-[#a140e5]"
            >
              SAVE
            </button>
          </div>
        </div>

        <div 
          className="relative mx-auto overflow-hidden rounded-lg border border-gray-600 bg-[#2e3054] shadow-lg" 
          style={{ 
            width: EDITOR_WIDTH,
            height: EDITOR_HEIGHT,
          }}
        >
          <div className="absolute left-0 top-0 z-10 w-full bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
            Editor Size: 1920x1080 (Scaled {SCALE_FACTOR * 100}%)
          </div>
          <GridLayout
            className="layout"
            layout={layout}
            cols={GRID_COLS}
            rowHeight={SCALED_ROW_HEIGHT}
            width={EDITOR_WIDTH}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".drag-handle"
            compactType={null}
            preventCollision
            margin={[0, 0]}
            containerPadding={[0, 0]}
            useCSSTransforms
          >
            {layout.map((item) => (
              <div 
                key={item.i} 
                className="drag-handle relative overflow-hidden rounded-md border border-gray-600 bg-[#43b581]"
              >
                <div className="absolute inset-0 flex items-center justify-center text-lg font-medium text-white">
                  {item.i}
                </div>
                <div className="absolute bottom-1 right-1 text-xs text-white opacity-50">
                  {item.w}x{item.h}
                </div>
              </div>
            ))}
          </GridLayout>
        </div>
      </div>
    </div>
  );
} 