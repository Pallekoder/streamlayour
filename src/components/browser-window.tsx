"use client";

import * as React from "react";
import { X, Maximize } from "lucide-react";

interface BrowserWindowProps {
  url: string;
  className?: string;
}

export function BrowserWindow({ url, className = "" }: BrowserWindowProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
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

  const injectFullscreenStyles = React.useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;

    try {
      const iframe = iframeRef.current;
      const win = iframe.contentWindow;
      if (!win) return;
      const doc = win.document;

      // Create and inject the fullscreen styles
      const style = doc.createElement('style');
      style.textContent = `
        html, body {
          width: 100vw !important;
          height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }

        /* Target all possible game containers */
        #gameHolder,
        #game-container,
        .game-container,
        [class*="game-container"],
        [class*="casino-game"],
        [class*="slot-container"],
        [id*="game-container"],
        [class*="game-holder"],
        [class*="frameHolder"],
        [class*="game_holder"],
        [class*="game-frame"],
        [class*="game_frame"],
        [class*="game-canvas"],
        [id*="game-canvas"],
        canvas,
        iframe {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          transform: none !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          z-index: 2147483647 !important;
        }

        /* Hide non-game elements */
        body > *:not(#gameHolder):not(#game-container):not([class*="game-container"]):not([class*="casino-game"]):not([class*="slot-container"]):not([class*="game-holder"]):not([class*="frameHolder"]):not([class*="game_holder"]):not([class*="game-frame"]):not([class*="game_frame"]):not([class*="game-canvas"]):not([id*="game-canvas"]):not(canvas):not(iframe):not(script):not(style) {
          display: none !important;
        }
      `;
      doc.head.appendChild(style);

      // Try to find and click any fullscreen buttons
      const fullscreenButtonSelectors = [
        'button[class*="fullscreen"]',
        'button[id*="fullscreen"]',
        'div[class*="fullscreen"]',
        'div[id*="fullscreen"]',
        '[class*="maximize"]',
        '[id*="maximize"]',
        'button:has(svg[class*="fullscreen"])',
        'button:has(img[alt*="fullscreen"])',
      ];

      const findAndClickFullscreenButton = () => {
        for (const selector of fullscreenButtonSelectors) {
          const button = doc.querySelector(selector);
          if (button && button instanceof HTMLElement) {
            button.click();
            return true;
          }
        }
        return false;
      };

      // Try multiple times to find and click the fullscreen button
      const retryInterval = setInterval(() => {
        if (findAndClickFullscreenButton()) {
          clearInterval(retryInterval);
        }
      }, 1000);

      // Clear interval after 10 seconds
      setTimeout(() => clearInterval(retryInterval), 10000);

      // Add message listener for fullscreen requests
      win.addEventListener('message', (event) => {
        if (event.data === 'requestFullscreen') {
          iframe.requestFullscreen?.();
        }
      });

    } catch (e) {
      console.warn('Could not inject fullscreen styles:', e);
    }
  }, []);

  const handleRefresh = React.useCallback(() => {
    setIsLoading(true);
    setError(null);

    if (iframeRef.current) {
      // Reset the iframe
      iframeRef.current.src = 'about:blank';
      iframeRef.current.src = formattedUrl;

      // Add load event listener
      const handleLoad = () => {
        setIsLoading(false);
        injectFullscreenStyles();
      };

      iframeRef.current.addEventListener('load', handleLoad);
      return () => iframeRef.current?.removeEventListener('load', handleLoad);
    }
  }, [formattedUrl, injectFullscreenStyles]);

  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleFullscreen = () => {
    if (iframeRef.current) {
      // Try multiple approaches to trigger fullscreen
      try {
        // 1. Try to make the iframe itself fullscreen
        iframeRef.current.requestFullscreen?.();

        // 2. Send message to iframe content
        iframeRef.current.contentWindow?.postMessage('requestFullscreen', '*');

        // 3. Try to inject and click fullscreen button
        injectFullscreenStyles();
      } catch (e) {
        console.warn('Fullscreen request failed:', e);
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
        <iframe
          ref={iframeRef}
          src={formattedUrl}
          className="h-full w-full flex-1 border-none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            margin: 0,
            padding: 0,
            overflow: 'hidden'
          }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-presentation allow-downloads allow-popups-to-escape-sandbox allow-top-navigation"
          allow="fullscreen; autoplay; camera; microphone; display-capture"
        />
      )}
    </div>
  );
} 