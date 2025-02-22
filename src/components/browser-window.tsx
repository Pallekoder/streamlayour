"use client";

import * as React from "react";
import { ExternalLink, X } from "lucide-react";

interface BrowserWindowProps {
  url: string;
  className?: string;
}

export function BrowserWindow({ url, className = "" }: BrowserWindowProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [gameWindow, setGameWindow] = React.useState<Window | null>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);

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

  // Function to create a preview of the game
  const createPreview = React.useCallback(() => {
    if (!previewRef.current) {
      setError('Preview container not found');
      return;
    }
    
    try {
      setError(null);
      setIsLoading(true);
      previewRef.current.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.src = formattedUrl;
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        pointer-events: none; // Prevent interaction with preview
      `;
      iframe.onerror = () => {
        setError('Failed to load game preview');
        setIsLoading(false);
      };
      iframe.onload = () => {
        setIsLoading(false);
      };
      previewRef.current.appendChild(iframe);
    } catch (e) {
      console.error('Preview creation error:', e);
      setError('Failed to create game preview');
      setIsLoading(false);
    }
  }, [formattedUrl]);

  React.useEffect(() => {
    createPreview();
  }, [createPreview]);

  // Function to launch the game in a new window
  const launchGame = () => {
    try {
      setError(null);
      
      // Close existing window if any
      if (gameWindow && !gameWindow.closed) {
        gameWindow.close();
      }

      // Get the screen dimensions
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;

      // Calculate the window size (slightly smaller than screen to account for borders)
      const windowWidth = screenWidth - 10;
      const windowHeight = screenHeight - 40;

      // Calculate position to center the window
      const left = 0;
      const top = 0;

      // Create a new window with specific features
      const newWindow = window.open(
        formattedUrl,
        'gameWindow',
        `width=${windowWidth},height=${windowHeight},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes`
      );

      if (!newWindow) {
        throw new Error('Failed to open game window. Please check if pop-ups are blocked.');
      }

      setGameWindow(newWindow);
      
      // Add styles to the new window when it loads
      newWindow.onload = () => {
        try {
          const doc = newWindow.document;
          const style = doc.createElement('style');
          style.textContent = `
            html, body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              width: 100vw;
              height: 100vh;
              background: black;
            }
            /* Target common game container classes */
            #gameHolder, #game-container, .game-container, [class*="game-container"],
            [class*="casino-game"], [class*="slot-container"], [id*="game-container"],
            [class*="game-holder"], [class*="frameHolder"], [class*="game_holder"],
            [class*="game-frame"], [class*="game_frame"] {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            /* Hide unnecessary elements */
            body > *:not(#gameHolder):not(#game-container):not([class*="game-container"]):not(script):not(style) {
              display: none !important;
            }
          `;
          doc.head.appendChild(style);

          // Try to go fullscreen after a short delay
          setTimeout(() => {
            try {
              doc.documentElement.requestFullscreen?.();
            } catch (e) {
              console.warn('Could not enter fullscreen:', e);
            }
          }, 1000);
        } catch (e) {
          console.warn('Could not modify game window:', e);
        }
      };

      // Focus the window
      newWindow.focus();
    } catch (e) {
      console.error('Game launch error:', e);
      setError(e instanceof Error ? e.message : 'Failed to launch game');
    }
  };

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden ${className}`}>
      <div className="absolute right-2 top-2 z-50 flex items-center gap-2">
        <button
          onClick={launchGame}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Launch Game</span>
        </button>
        <button
          onClick={createPreview}
          className="rounded-md bg-black/50 p-2 text-white opacity-50 hover:opacity-100"
          title="Refresh Preview"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-lg text-white">Loading Preview...</div>
        </div>
      )}

      {error ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-red-500/10 p-8 text-center">
          <div className="max-w-md whitespace-pre-wrap text-red-500">{error}</div>
          <button
            onClick={createPreview}
            className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="relative flex h-full w-full flex-col">
          <div 
            ref={previewRef}
            className="relative h-full w-full flex-1"
            style={{ background: 'black' }}
          />
          {!isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75">
              <button
                onClick={launchGame}
                className="flex items-center gap-3 rounded-lg bg-primary px-6 py-3 text-lg font-medium text-white hover:bg-primary/90"
              >
                <ExternalLink className="h-6 w-6" />
                <span>Launch Game in New Window</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 