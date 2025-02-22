"use client";

import * as React from "react";
import { RotateCw } from "lucide-react";

interface BrowserWindowProps {
  url: string;
  className?: string;
}

export function BrowserWindow({ url, className = "" }: BrowserWindowProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

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
    if (!iframeRef.current) {
      setError('Game container not found');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      iframeRef.current.src = formattedUrl;
    } catch (e) {
      console.error('Refresh error:', e);
      setError('Failed to refresh game');
      setIsLoading(false);
    }
  }, [formattedUrl]);

  // Handle iframe load events
  const handleLoad = () => {
    setIsLoading(false);
    setError(null);

    // Try to inject styles to maximize the game within the iframe
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

      const style = iframe.contentDocument.createElement('style');
      style.textContent = `
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          width: 100% !important;
          height: 100% !important;
          background: black !important;
        }
        /* Target common game container classes */
        #gameHolder, #game-container, .game-container, [class*="game-container"],
        [class*="casino-game"], [class*="slot-container"], [id*="game-container"],
        [class*="game-holder"], [class*="frameHolder"], [class*="game_holder"],
        [class*="game-frame"], [class*="game_frame"] {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: none !important;
        }
        /* Hide unnecessary elements */
        body > *:not(#gameHolder):not(#game-container):not([class*="game-container"]):not(script):not(style) {
          display: none !important;
        }
      `;
      iframe.contentDocument.head.appendChild(style);
    } catch (e) {
      console.warn('Could not inject styles:', e);
    }
  };

  const handleError = () => {
    setError('Failed to load game');
    setIsLoading(false);
  };

  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden bg-black ${className}`}>
      <div className="absolute right-2 top-2 z-50 flex items-center gap-2">
        <button
          onClick={handleRefresh}
          className="rounded-md bg-black/50 p-2 text-white opacity-50 hover:opacity-100"
          title="Refresh Game"
        >
          <RotateCw className="h-4 w-4" />
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
        <iframe
          ref={iframeRef}
          className="h-full w-full border-none"
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
          title="Game Window"
        />
      )}
    </div>
  );
} 