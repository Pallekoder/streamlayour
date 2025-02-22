"use client";

import * as React from "react";
import { BackgroundSettings, BackgroundType } from "@/lib/types";

interface BackgroundSettingsProps {
  settings: BackgroundSettings;
  onChange: (settings: BackgroundSettings) => void;
}

export function BackgroundSettings({ settings, onChange }: BackgroundSettingsProps) {
  const handleTypeChange = (type: BackgroundType) => {
    onChange({ ...settings, type });
  };

  const handleValueChange = (value: string) => {
    onChange({ ...settings, value });
  };

  const handleOpacityChange = (opacity: number) => {
    onChange({ ...settings, opacity });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block font-medium">Background Type</label>
        <select
          value={settings.type}
          onChange={(e) => handleTypeChange(e.target.value as BackgroundType)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2"
        >
          <option value="color">Solid Color</option>
          <option value="gradient">Gradient</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>

      {settings.type === "color" && (
        <div>
          <label className="mb-2 block font-medium">Color</label>
          <input
            type="color"
            value={settings.value}
            onChange={(e) => handleValueChange(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-transparent p-1"
          />
        </div>
      )}

      {settings.type === "gradient" && (
        <div>
          <label className="mb-2 block font-medium">Gradient CSS</label>
          <input
            type="text"
            value={settings.value}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="linear-gradient(45deg, #000, #fff)"
            className="w-full rounded-md border border-input bg-transparent px-3 py-2"
          />
        </div>
      )}

      {(settings.type === "image" || settings.type === "video") && (
        <div>
          <label className="mb-2 block font-medium">URL</label>
          <input
            type="url"
            value={settings.value}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={`Enter ${settings.type} URL`}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2"
          />
        </div>
      )}

      <div>
        <label className="mb-2 block font-medium">Opacity ({settings.opacity}%)</label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.opacity}
          onChange={(e) => handleOpacityChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
} 