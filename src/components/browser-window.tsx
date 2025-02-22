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

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);

    // Try to find and click the fullscreen button in the iframe
    try {
      const iframe = iframeRef.current;
      if (iframe) {
        // Wait a bit for the content to be fully loaded
        setTimeout(() => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              // Look for common fullscreen button selectors
              const fullscreenButton = iframeDoc.querySelector(
                '[data-test-id="game-fullscreen-button"], ' +
                '.fullscreen-button, ' +
                '.fullscreen-toggle, ' +
                '[aria-label*="fullscreen" i], ' +
                '[title*="fullscreen" i], ' +
                'button:has(svg[class*="fullscreen" i]), ' +
                '.game-control--fullscreen, ' +
                '.game-fullscreen-button, ' +
                '.game-controls__fullscreen, ' +
                '.game-controls__button--fullscreen, ' +
                '[class*="fullscreen-button"], ' +
                '[id*="fullscreen-button"]'
              );
              
              if (fullscreenButton instanceof HTMLElement) {
                fullscreenButton.click();
              }

              // Hide unwanted UI elements
              const style = iframeDoc.createElement('style');
              style.textContent = `
                /* Hide scrollbars */
                ::-webkit-scrollbar { display: none !important; }
                * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
                
                /* Hide navigation elements */
                nav, header, .header, .navigation, .nav-bar, .navbar, .top-bar, .topbar,
                .left-navigation, .sidebar, .side-nav, nav[class*="sidebar"], div[class*="sidebar"],
                .menu-bar, .menubar, .toolbar, .tool-bar, .controls-bar, .game-controls:not(.game-control--fullscreen),
                [class*="navigation"], [class*="header"], [class*="toolbar"], [class*="controls"]:not(.fullscreen),
                .game-menu, .game-overlay, .game-ui, .game-controls-wrapper:not(.fullscreen),
                [class*="menu-"], [class*="overlay-"], [class*="ui-"], [class*="controls-"]:not(.fullscreen),
                [id*="menu-"], [id*="overlay-"], [id*="ui-"], [id*="controls-"]:not(.fullscreen) { 
                  display: none !important; 
                }
                
                /* Make game container fullscreen */
                #game-container, #game-wrapper, .game-container, .game-wrapper,
                [class*="game-container"], [class*="game-wrapper"], [id*="game-container"], [id*="game-wrapper"],
                .game-iframe-wrapper, .game-iframe-container,
                .game, .game-frame, .game-area, .game-view,
                [class*="game-"], [id*="game-"],
                .slot-container, .slot-wrapper, .slot-game, .slot-view,
                [class*="slot-"], [id*="slot-"] { 
                  width: 100vw !important; 
                  height: 100vh !important; 
                  max-width: none !important; 
                  max-height: none !important; 
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  right: 0 !important;
                  bottom: 0 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  border: none !important;
                  background: transparent !important;
                  transform: none !important;
                  transition: none !important;
                }
                
                /* Ensure the game takes full space */
                body, html {
                  overflow: hidden !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  background: transparent !important;
                }
                
                /* Hide any overlay elements except game */
                body > *:not(#game-container):not(.game-container):not(#game-wrapper):not(.game-wrapper):not(script):not(style):not(.game):not(.slot-container) {
                  display: none !important;
                }

                /* Ensure iframes are fullscreen */
                iframe {
                  width: 100vw !important;
                  height: 100vh !important;
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  border: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
              `;
              iframeDoc.head.appendChild(style);
            }
          } catch (e) {
            console.warn('Could not modify iframe content:', e);
          }
        }, 2000);
      }
    } catch (e) {
      console.warn('Error accessing iframe content:', e);
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
          onLoad={handleLoad}
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