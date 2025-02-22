"use client";

import * as React from "react";
import { X } from "lucide-react";

interface BrowserWindowProps {
  url: string;
  className?: string;
}

export function BrowserWindow({ url, className = "" }: BrowserWindowProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [gameWindow, setGameWindow] = React.useState<Window | null>(null);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (iframeRef.current) {
      iframeRef.current.src = formattedUrl;
    }
  };

  // Format URL and ensure it's valid
  const formattedUrl = React.useMemo(() => {
    try {
      const urlToFormat = url.trim();
      
      // If it's a relative URL or already has a protocol, leave it as is
      if (urlToFormat.startsWith('/') || urlToFormat.startsWith('http://') || urlToFormat.startsWith('https://')) {
        return urlToFormat;
      }

      // Add https:// by default
      return `https://${urlToFormat}`;
    } catch (e) {
      console.error('URL formatting error:', e);
      return url;
    }
  }, [url]);

  const openGameWindow = () => {
    // Close existing window if any
    if (gameWindow && !gameWindow.closed) {
      gameWindow.close();
    }

    // Calculate the screen dimensions
    const width = window.screen.width;
    const height = window.screen.height;

    // Open new window with specific features
    const newWindow = window.open(formattedUrl, 'gameWindow', 
      `width=${width},height=${height},left=0,top=0,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no`
    );

    if (newWindow) {
      setGameWindow(newWindow);
      
      // Inject fullscreen styles when the window loads
      newWindow.onload = () => {
        try {
          const doc = newWindow.document;
          
          // Add styles to make the game fullscreen
          const style = doc.createElement('style');
          style.textContent = `
            body, html {
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
            [class*="game_frame"] {
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

            /* Target game elements */
            iframe, canvas, [class*="game-canvas"], [id*="game-canvas"] {
              width: 100vw !important;
              height: 100vh !important;
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              transform: none !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              z-index: 2147483647 !important;
            }

            /* Hide all other elements */
            body > *:not(#gameHolder):not(#game-container):not([class*="game-container"]):not([class*="casino-game"]):not([class*="slot-container"]):not([class*="game-holder"]):not([class*="frameHolder"]):not([class*="game_holder"]):not([class*="game-frame"]):not([class*="game_frame"]):not(script):not(style) {
              display: none !important;
            }
          `;
          doc.head.appendChild(style);

          // Request fullscreen
          const requestFullscreen = () => {
            try {
              const element = doc.documentElement;
              if (element.requestFullscreen) {
                element.requestFullscreen();
              } else {
                // Use any to bypass TypeScript checking for vendor prefixes
                const docAny = element as any;
                if (docAny.webkitRequestFullscreen) {
                  docAny.webkitRequestFullscreen();
                } else if (docAny.mozRequestFullScreen) {
                  docAny.mozRequestFullScreen();
                } else if (docAny.msRequestFullscreen) {
                  docAny.msRequestFullscreen();
                }
              }
            } catch (e) {
              console.warn('Fullscreen request failed:', e);
            }
          };

          // Try to go fullscreen after a short delay
          setTimeout(requestFullscreen, 1000);

          // Add a button to manually trigger fullscreen
          const fullscreenButton = doc.createElement('button');
          fullscreenButton.textContent = 'Fullscreen';
          fullscreenButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 2147483647;
            padding: 8px 16px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          `;
          fullscreenButton.onclick = requestFullscreen;
          doc.body.appendChild(fullscreenButton);
        } catch (e) {
          console.warn('Error setting up game window:', e);
        }
      };

      // Focus the window
      newWindow.focus();
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setError(
      `Unable to load the content. This could be because:\n` +
      `1. The website doesn't allow embedding\n` +
      `2. The URL is incorrect\n` +
      `3. There's no internet connection\n\n` +
      `URL attempted: ${formattedUrl}`
    );
  };

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden ${className}`}>
      <div className="absolute right-2 top-2 z-50 flex items-center gap-2">
        <button
          onClick={openGameWindow}
          className="rounded-md bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90"
        >
          Open Game
        </button>
        <button
          onClick={handleClose}
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
            onClick={() => {
              setIsLoading(true);
              setError(null);
              if (iframeRef.current) {
                iframeRef.current.src = formattedUrl;
              }
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src={formattedUrl}
          className="h-full w-full flex-1 border-none bg-background"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-presentation allow-downloads allow-popups-to-escape-sandbox allow-top-navigation"
          onLoad={() => {
            setIsLoading(false);
            setError(null);
          }}
          onError={handleError}
          loading="eager"
          allow="fullscreen; autoplay; camera; microphone; display-capture"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            zIndex: 1
          }}
        />
      )}
    </div>
  );
} 