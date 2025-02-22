"use client";

import * as React from "react";
import { X, Maximize, Minimize } from "lucide-react";

interface BrowserWindowProps {
  url: string;
  className?: string;
}

export function BrowserWindow({ url, className = "" }: BrowserWindowProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const gameRef = React.useRef<HTMLDivElement>(null);

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

  const handleRefresh = React.useCallback(() => {
    setIsLoading(true);
    setError(null);

    // Create a new game container
    if (gameRef.current) {
      gameRef.current.innerHTML = '';

      // Create a container for the game
      const container = document.createElement('div');
      container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
      `;

      // Create the game iframe
      const iframe = document.createElement('iframe');
      iframe.src = formattedUrl;
      iframe.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
      `;
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('allow', 'fullscreen; autoplay; camera; microphone; display-capture');
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-presentation allow-downloads allow-popups-to-escape-sandbox allow-top-navigation');

      // Handle iframe load
      iframe.onload = () => {
        setIsLoading(false);
        try {
          // Try to inject styles into the iframe
          const doc = iframe.contentWindow?.document;
          if (doc) {
            const style = doc.createElement('style');
            style.textContent = `
              body { margin: 0; padding: 0; overflow: hidden; }
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
            doc.head.appendChild(style);
          }
        } catch (e) {
          console.warn('Could not inject styles:', e);
        }
      };

      iframe.onerror = () => {
        setIsLoading(false);
        setError('Failed to load game');
      };

      container.appendChild(iframe);
      gameRef.current.appendChild(container);
    }
  }, [formattedUrl]);

  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`${isExpanded ? 'fixed inset-0 z-[9999] bg-black' : 'relative'} flex h-full w-full flex-col overflow-hidden ${className}`}
      style={{
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <div className={`absolute right-2 top-2 z-50 flex items-center gap-2 ${isExpanded ? 'p-4' : ''}`}>
        <button
          onClick={toggleExpand}
          className="rounded-md bg-black/50 p-2 text-white opacity-50 hover:opacity-100"
          title={isExpanded ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isExpanded ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
        </button>
        <button
          onClick={handleRefresh}
          className="rounded-md bg-black/50 p-2 text-white opacity-50 hover:opacity-100"
          title="Refresh"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-lg text-white">Loading Game...</div>
        </div>
      )}

      {error ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-red-500/10 p-8 text-center">
          <div className="max-w-md whitespace-pre-wrap text-red-500">{error}</div>
          <button
            onClick={handleRefresh}
            className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div 
          ref={gameRef}
          className="relative h-full w-full flex-1"
          style={{
            background: 'black',
            ...(isExpanded && {
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9998,
            })
          }}
        />
      )}
    </div>
  );
} 