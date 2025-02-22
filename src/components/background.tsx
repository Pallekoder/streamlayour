"use client";

import * as React from "react";
import { type BackgroundSettings } from "@/lib/types";

interface BackgroundProps {
  settings: BackgroundSettings;
  className?: string;
}

export function Background({ settings, className = "" }: BackgroundProps) {
  const style = React.useMemo(() => {
    const opacity = settings.opacity !== undefined ? settings.opacity / 100 : 0.5;

    switch (settings.type) {
      case "color":
        return {
          backgroundColor: settings.value,
          opacity,
        };
      case "gradient":
        return {
          background: settings.value,
          opacity,
        };
      case "image":
        return {
          backgroundImage: `url(${settings.value})`,
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
  }, [settings]);

  if (settings.type === "video") {
    return (
      <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`} style={{ opacity: style.opacity }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src={settings.value} />
        </video>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 -z-10 ${className}`}
      style={style}
    />
  );
} 