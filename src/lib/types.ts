export type WindowType = "browser" | "camera" | "chat" | "ad";

export type BackgroundType = "color" | "gradient" | "image" | "video";

export interface BackgroundSettings {
  type: BackgroundType;
  value: string; // CSS color, gradient, or URL
  opacity?: number;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: WindowType;
  url?: string;
  deviceId?: string; // For webcam selection
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  zIndex?: number;
  isVisible?: boolean;
}

export interface AppSettings {
  background: BackgroundSettings;
  defaultWindowSizes: Record<WindowType, { w: number; h: number }>;
  autoSave: boolean;
} 