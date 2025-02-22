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
import { BackgroundSettings } from "@/components/background-settings";
import { Header } from "@/components/header";
import type { LayoutItem, BackgroundSettings as BackgroundSettingsType } from "@/lib/types";
import { Save, Trash2, Edit3 } from "lucide-react";

// Calculate the editor dimensions that maintain the aspect ratio
const EDITOR_WIDTH = MONITOR_WIDTH * SCALE_FACTOR;
const EDITOR_HEIGHT = MONITOR_HEIGHT * SCALE_FACTOR;

// Calculate the scaled row height
const SCALED_ROW_HEIGHT = GRID_ROW_HEIGHT * SCALE_FACTOR;

interface WebcamDevice {
  deviceId: string;
  label: string;
}

interface SavedLayout {
  id: string;
  name: string;
  layout: LayoutItem[];
  createdAt: number;
}

export default function SettingsPage() {
  const STREAM_PLATFORMS = React.useMemo(() => [
    { 
      id: "twitch", 
      name: "Twitch", 
      url: "https://www.twitch.tv/embed/USERNAME/chat?parent=" + (typeof window !== 'undefined' ? window.location.hostname : ''),
      authUrl: "https://www.twitch.tv/login"
    },
    { 
      id: "youtube", 
      name: "YouTube", 
      url: "https://www.youtube.com/live_chat?v=VIDEO_ID&embed_domain=" + (typeof window !== 'undefined' ? window.location.hostname : ''),
      authUrl: "https://accounts.google.com"
    },
    { 
      id: "kick", 
      name: "Kick", 
      url: "https://kick.com/USERNAME/chatroom",
      authUrl: "https://kick.com/login"
    }
  ], []);

  const [layout, setLayout] = React.useState<LayoutItem[]>([]);
  const [selectedType, setSelectedType] = React.useState<LayoutItem["type"]>("browser");
  const [selectedItem, setSelectedItem] = React.useState<LayoutItem | null>(null);
  const [backgroundSettings, setBackgroundSettings] = React.useState<BackgroundSettingsType>({
    type: "color",
    value: "#1a1b36",
    opacity: 100
  });

  // New state for window configuration
  const [webcamDevices, setWebcamDevices] = React.useState<WebcamDevice[]>([]);
  const [selectedWebcam, setSelectedWebcam] = React.useState("");
  const [selectedPlatform, setSelectedPlatform] = React.useState(STREAM_PLATFORMS[0].id);
  const [channelName, setChannelName] = React.useState("");
  const [adUrl, setAdUrl] = React.useState("");
  const [browserUrl, setBrowserUrl] = React.useState("");

  // Add to existing state
  const [savedLayouts, setSavedLayouts] = React.useState<SavedLayout[]>([]);
  const [currentLayoutName, setCurrentLayoutName] = React.useState("");
  const [editingLayoutId, setEditingLayoutId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const savedLayout = localStorage.getItem("currentLayout");
    if (savedLayout) {
      setLayout(JSON.parse(savedLayout));
    }

    const savedLayoutsStr = localStorage.getItem("layoutPresets");
    if (savedLayoutsStr) {
      setSavedLayouts(JSON.parse(savedLayoutsStr));
    }

    const savedBackground = localStorage.getItem("backgroundSettings");
    if (savedBackground) {
      setBackgroundSettings(JSON.parse(savedBackground));
    }

    // Load webcam devices
    async function loadWebcams() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
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
  }, []);

  const validateUrl = (url: string, type: 'ad' | 'browser'): boolean => {
    try {
      const urlToCheck = url.trim();
      if (!urlToCheck) return false;

      if (type === 'ad') {
        const extension = urlToCheck.toLowerCase().split('.').pop();
        return ['mp4', 'gif', 'jpg', 'jpeg', 'png'].includes(extension || '');
      }
      
      // For browser URLs, just ensure it's not empty
      return true;
    } catch {
      return false;
    }
  };

  const formatUrl = (url: string): string => {
    const urlToFormat = url.trim();
    if (!urlToFormat.startsWith('http://') && !urlToFormat.startsWith('https://')) {
      return `https://${urlToFormat}`;
    }
    return urlToFormat;
  };

  const getChatUrl = (platform: string, channel: string): string => {
    const platformConfig = STREAM_PLATFORMS.find(p => p.id === platform);
    if (!platformConfig) return '';
    return platformConfig.url.replace('USERNAME', channel);
  };

  const addWindow = () => {
    const defaultSize = DEFAULT_SIZES[selectedType];
    const existingTypeCount = layout.filter(item => item.type === selectedType).length;
    
    let url: string | undefined;
    let deviceId: string | undefined;

    // Validate and set URL/deviceId based on type
    switch (selectedType) {
      case 'browser':
        if (!validateUrl(browserUrl, 'browser')) {
          alert('Please enter a valid URL for the browser window');
          return;
        }
        url = formatUrl(browserUrl);
        localStorage.setItem("casinoUrl", url); // Store the URL
        break;
      case 'chat':
        if (!channelName) {
          alert('Please enter a channel name');
          return;
        }
        url = getChatUrl(selectedPlatform, channelName);
        break;
      case 'camera':
        if (!selectedWebcam) {
          alert('Please select a webcam');
          return;
        }
        deviceId = selectedWebcam;
        localStorage.setItem("webcamUrl", deviceId); // Store the device ID
        break;
      case 'ad':
        if (!validateUrl(adUrl, 'ad')) {
          alert('Please enter a valid URL for an image, GIF, or MP4 file');
          return;
        }
        url = formatUrl(adUrl);
        break;
    }

    const newItem: LayoutItem = {
      i: `${selectedType.toUpperCase()}-${existingTypeCount}`,
      x: 0,
      y: 0,
      w: defaultSize.w,
      h: defaultSize.h,
      type: selectedType,
      url,
      deviceId,
      minW: WINDOW_SETTINGS.minW,
      minH: WINDOW_SETTINGS.minH,
      maxW: WINDOW_SETTINGS.maxW,
      maxH: WINDOW_SETTINGS.maxH,
      zIndex: selectedType === "ad" ? Math.max(...layout.map(item => item.zIndex || 1), 0) + 1 : 1,
      isVisible: true,
    };
    setLayout([...layout, newItem]);
    saveLayout(); // Save immediately after adding
  };

  const renderWindowConfig = () => {
    switch (selectedType) {
      case 'browser':
        return (
          <div className="mb-4">
            <label className="mb-2 block text-sm text-white">Browser URL</label>
            <input
              type="url"
              value={browserUrl}
              onChange={(e) => setBrowserUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
            />
          </div>
        );
      case 'chat':
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-white">Platform</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
              >
                {STREAM_PLATFORMS.map(platform => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white">Channel Name</label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Enter channel name"
                className="w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
              />
            </div>
            <div>
              <a
                href={STREAM_PLATFORMS.find(p => p.id === selectedPlatform)?.authUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-md bg-[#43b581] px-4 py-2 text-white hover:bg-[#3ca374]"
              >
                Login to {STREAM_PLATFORMS.find(p => p.id === selectedPlatform)?.name}
              </a>
            </div>
          </div>
        );
      case 'camera':
        return (
          <div>
            <label className="mb-2 block text-sm text-white">Select Webcam</label>
            <select
              value={selectedWebcam}
              onChange={(e) => setSelectedWebcam(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
            >
              <option value="">Choose a webcam</option>
              {webcamDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
          </div>
        );
      case 'ad':
        return (
          <div>
            <label className="mb-2 block text-sm text-white">Advertisement URL (MP4/GIF/Image)</label>
            <input
              type="url"
              value={adUrl}
              onChange={(e) => setAdUrl(e.target.value)}
              placeholder="https://example.com/ad.mp4"
              className="w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
            />
          </div>
        );
    }
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    // Calculate maximum allowed positions based on editor dimensions
    const maxRows = Math.floor(EDITOR_HEIGHT / SCALED_ROW_HEIGHT);

    // Ensure windows stay within visible bounds
    const constrainedLayout = newLayout.map((item) => {
      // Get the item's current dimensions
      const w = Math.min(item.w, GRID_COLS);
      const h = Math.min(item.h, maxRows);

      // Calculate maximum allowed positions
      const maxX = GRID_COLS - w;
      const maxY = maxRows - h;

      // Constrain the position
      const x = Math.min(Math.max(0, item.x), maxX);
      const y = Math.min(Math.max(0, item.y), maxY);

      return {
        ...item,
        x,
        y,
        w,
        h
      };
    });

    setLayout((prevLayout) =>
      prevLayout.map((item, i) => ({
        ...item,
        x: constrainedLayout[i].x,
        y: constrainedLayout[i].y,
        w: constrainedLayout[i].w,
        h: constrainedLayout[i].h,
      }))
    );
  };

  const updateItemZIndex = (itemId: string, delta: number) => {
    setLayout(prevLayout => 
      prevLayout.map(item => 
        item.i === itemId 
          ? { ...item, zIndex: (item.zIndex || 1) + delta }
          : item
      )
    );
  };

  const toggleWindowVisibility = (itemId: string) => {
    setLayout(prevLayout =>
      prevLayout.map(item =>
        item.i === itemId
          ? { ...item, isVisible: !item.isVisible }
          : item
      )
    );
  };

  const saveLayout = () => {
    localStorage.setItem("currentLayout", JSON.stringify(layout));
    localStorage.setItem("backgroundSettings", JSON.stringify(backgroundSettings));
  };

  // Add new functions for layout management
  const saveAsNewLayout = () => {
    if (!currentLayoutName.trim()) {
      alert("Please enter a layout name");
      return;
    }

    const newLayout: SavedLayout = {
      id: Date.now().toString(),
      name: currentLayoutName,
      layout: layout,
      createdAt: Date.now()
    };

    const updatedLayouts = [...savedLayouts, newLayout];
    setSavedLayouts(updatedLayouts);
    localStorage.setItem("layoutPresets", JSON.stringify(updatedLayouts));
    setCurrentLayoutName("");
  };

  const updateExistingLayout = (layoutId: string) => {
    const updatedLayouts = savedLayouts.map(l => 
      l.id === layoutId ? { ...l, layout: layout } : l
    );
    setSavedLayouts(updatedLayouts);
    localStorage.setItem("layoutPresets", JSON.stringify(updatedLayouts));
  };

  const loadLayout = (layoutId: string) => {
    const layoutToLoad = savedLayouts.find(l => l.id === layoutId);
    if (layoutToLoad) {
      setLayout(layoutToLoad.layout);
      setEditingLayoutId(layoutId);
      localStorage.setItem("currentLayout", JSON.stringify(layoutToLoad.layout));
    }
  };

  const deleteLayout = (layoutId: string) => {
    const updatedLayouts = savedLayouts.filter(l => l.id !== layoutId);
    setSavedLayouts(updatedLayouts);
    localStorage.setItem("layoutPresets", JSON.stringify(updatedLayouts));
    if (editingLayoutId === layoutId) {
      setEditingLayoutId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b36] p-8">
      <div className="mx-auto max-w-7xl">
        <Header />
        <h1 className="mb-8 text-center text-3xl font-bold text-white">SETTINGS</h1>

        <div className="mb-8 grid grid-cols-3 gap-6">
          <div className="space-y-4">
            <h2 className="mb-2 text-sm font-medium text-white">ADD NEW ITEM</h2>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as LayoutItem["type"])}
              className="w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
            >
              <option value="browser">Screen</option>
              <option value="chat">Chat</option>
              <option value="camera">Camera</option>
              <option value="ad">Advertisement</option>
            </select>
            {renderWindowConfig()}
            <button
              onClick={addWindow}
              className="w-full rounded-md bg-[#2e3054] px-4 py-2 text-white transition-colors hover:bg-[#3d3f6d]"
            >
              ADD
            </button>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-white">LAYER CONTROL</h2>
            <div className="flex gap-2">
              <button
                onClick={() => selectedItem && updateItemZIndex(selectedItem.i, -1)}
                className="flex-1 rounded-md bg-[#2e3054] px-4 py-2 text-white transition-colors hover:bg-[#3d3f6d]"
                disabled={!selectedItem}
              >
                Move Back
              </button>
              <button
                onClick={() => selectedItem && updateItemZIndex(selectedItem.i, 1)}
                className="flex-1 rounded-md bg-[#2e3054] px-4 py-2 text-white transition-colors hover:bg-[#3d3f6d]"
                disabled={!selectedItem}
              >
                Move Front
              </button>
            </div>
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

          <div className="col-span-3">
            <h2 className="mb-4 text-lg font-medium text-white">CURRENT WINDOWS</h2>
            <div className="grid grid-cols-3 gap-4">
              {layout.map((item) => (
                <div
                  key={item.i}
                  className={`rounded-md border border-gray-600 bg-[#2e3054] p-4 ${
                    selectedItem === item ? "ring-2 ring-white" : ""
                  } ${!item.isVisible ? "opacity-50" : ""}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-white">{item.i}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWindowVisibility(item.i);
                        }}
                        className={`px-2 py-1 rounded ${
                          item.isVisible 
                            ? "bg-[#43b581] hover:bg-[#3ca374]" 
                            : "bg-[#ff6b6b] hover:bg-[#ff5252]"
                        }`}
                      >
                        {item.isVisible ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLayout(layout.filter(l => l.i !== item.i));
                        }}
                        className="text-red-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p>Type: {item.type}</p>
                    <p>Size: {item.w}x{item.h}</p>
                    <p>Position: ({item.x}, {item.y})</p>
                    {item.url && (
                      <p className="truncate">URL: {item.url}</p>
                    )}
                    {item.deviceId && (
                      <p className="truncate">Device: {
                        webcamDevices.find(d => d.deviceId === item.deviceId)?.label || item.deviceId
                      }</p>
                    )}
                    {item.type === "ad" && (
                      <p>Z-Index: {item.zIndex || 1}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-3">
            <h2 className="mb-4 text-lg font-medium text-white">SAVED LAYOUTS</h2>
            <div className="mb-4 flex items-center gap-4">
              <input
                type="text"
                value={currentLayoutName}
                onChange={(e) => setCurrentLayoutName(e.target.value)}
                placeholder="Enter layout name"
                className="flex-1 rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white"
              />
              <button
                onClick={saveAsNewLayout}
                className="flex items-center gap-2 rounded-md bg-[#43b581] px-4 py-2 text-white hover:bg-[#3ca374]"
              >
                <Save className="h-4 w-4" />
                Save as New Layout
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {savedLayouts.map((savedLayout) => (
                <div
                  key={savedLayout.id}
                  className={`rounded-md border border-gray-600 bg-[#2e3054] p-4 ${
                    editingLayoutId === savedLayout.id ? "ring-2 ring-white" : ""
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-white">{savedLayout.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadLayout(savedLayout.id)}
                        className="rounded bg-[#43b581] p-1 text-white hover:bg-[#3ca374]"
                        title="Load Layout"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {editingLayoutId === savedLayout.id && (
                        <button
                          onClick={() => updateExistingLayout(savedLayout.id)}
                          className="rounded bg-[#b659ff] p-1 text-white hover:bg-[#a140e5]"
                          title="Update Current Layout"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteLayout(savedLayout.id)}
                        className="rounded bg-[#ff6b6b] p-1 text-white hover:bg-[#ff5252]"
                        title="Delete Layout"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(savedLayout.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-medium text-white">BACKGROUND SETTINGS</h2>
          <BackgroundSettings
            settings={backgroundSettings}
            onChange={(newSettings) => {
              setBackgroundSettings(newSettings);
              localStorage.setItem("backgroundSettings", JSON.stringify(newSettings));
            }}
          />
        </div>

        <div 
          className="relative mb-8 mx-auto overflow-hidden rounded-lg border-2 border-dashed border-gray-600 bg-[#2e3054] shadow-lg" 
          style={{ width: EDITOR_WIDTH, height: EDITOR_HEIGHT }}
        >
          <div className="absolute inset-0 pointer-events-none border-4 border-gray-600/20"></div>
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
            isBounded
            maxRows={Math.floor(EDITOR_HEIGHT / SCALED_ROW_HEIGHT)}
            margin={[0, 0]}
            containerPadding={[0, 0]}
            useCSSTransforms
          >
            {layout.map((item) => (
              <div 
                key={item.i} 
                className={`drag-handle relative overflow-hidden rounded-md border border-gray-600 ${
                  item.type === "ad" ? "bg-[#ff6b6b]" : "bg-[#43b581]"
                } ${selectedItem === item ? "ring-2 ring-white" : ""} ${
                  !item.isVisible ? "opacity-50" : ""
                }`}
                style={{ 
                  zIndex: item.zIndex || 1,
                  position: 'absolute',
                  width: '100%',
                  height: '100%'
                }}
                onClick={() => setSelectedItem(item)}
              >
                <div className="absolute inset-0 flex items-center justify-center text-lg font-medium text-white">
                  {item.i}
                </div>
                {item.type === "ad" && (
                  <div className="absolute bottom-1 right-1 text-xs text-white">
                    z-index: {item.zIndex || 1}
                  </div>
                )}
              </div>
            ))}
          </GridLayout>
        </div>
      </div>
    </div>
  );
} 