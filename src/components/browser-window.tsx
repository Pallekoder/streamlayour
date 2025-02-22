"use client";

import * as React from "react";
import { X, Maximize } from "lucide-react";

interface BrowserWindowProps {
  url: string;
  className?: string;
}

export function BrowserWindow({ url, className = "" }: BrowserWindowProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Format URL and ensure it's valid
  const formattedUrl = React.useMemo(() => {
    try {
      const urlToFormat = url.trim();
      if (urlToFormat.startsWith('/') || urlToFormat.startsWith('http://') || urlToFormat.startsWith('https://')) {
        return urlToFormat;
      }
      return `https://${urlToFormat}`;
    } catch (e) {
      console.error('URL formatting error:', e);
      return url;
    }
  }, [url]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    
    // Force reload by recreating the object element
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const object = document.createElement('object');
      object.data = formattedUrl;
      object.type = 'text/html';
      object.style.cssText = 'width: 100%; height: 100%; border: none;';
      
      // Add event listeners
      object.onload = () => {
        setIsLoading(false);
        try {
          // Try to access the object's content window
          const contentWindow = (object as any).contentWindow;
          if (contentWindow) {
            // Apply fullscreen styles
            const style = document.createElement('style');
            style.textContent = `
              body, html {
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
              }
              #gameHolder, #game-container, .game-container, [class*="game-container"] {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            `;
            contentWindow.document.head.appendChild(style);
          }
        } catch (e) {
          console.warn('Could not modify content:', e);
        }
      };
      object.onerror = () => {
        setIsLoading(false);
        setError('Failed to load content');
      };

      // Add fallback content
      const embed = document.createElement('embed');
      embed.src = formattedUrl;
      embed.type = 'text/html';
      embed.style.cssText = 'width: 100%; height: 100%; border: none;';
      object.appendChild(embed);

      containerRef.current.appendChild(object);
    }
  };

  React.useEffect(() => {
    handleRefresh();
  }, [formattedUrl]);

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden ${className}`}>
      <div className="absolute right-2 top-2 z-50 flex items-center gap-2">
        <button
          onClick={handleFullscreen}
          className="rounded-md bg-black/50 p-1 text-white opacity-50 hover:opacity-100"
          title="Fullscreen"
        >
          <Maximize className="h-4 w-4" />
        </button>
        <button
          onClick={handleRefresh}
          className="rounded-md bg-black/50 p-1 text-white opacity-50 hover:opacity-100"
          title="Refresh"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}

      {error ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-destructive/10 p-8 text-center text-sm text-destructive">
          <div className="max-w-md whitespace-pre-wrap">{error}</div>
          <button
            onClick={handleRefresh}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div 
          ref={containerRef} 
          className="h-full w-full flex-1"
          style={{
            position: 'relative',
            overflow: 'hidden'
          }}
        />
      )}
    </div>
  );
} 