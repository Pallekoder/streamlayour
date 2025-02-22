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

    try {
      const iframe = iframeRef.current;
      if (iframe) {
        // Send fullscreen request via postMessage
        const fullscreenMessage = {
          action: 'requestFullscreen',
          type: 'gameFullscreen'
        };

        // Try different message formats that slot sites might use
        const messages = [
          fullscreenMessage,
          { command: 'fullscreen' },
          { type: 'fullscreen' },
          { action: 'maximize' },
          { method: 'fullscreen', value: true },
          { event: 'fullscreen' }
        ];

        // Wait for iframe to be ready
        setTimeout(() => {
          try {
            // Send all possible message formats
            messages.forEach(msg => {
              iframe.contentWindow?.postMessage(msg, '*');
            });

            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              // Enhanced selectors for fullscreen buttons (as backup)
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
                '[id*="fullscreen-button"], ' +
                '.casino-game-fullscreen, ' +
                '.slot-fullscreen-button, ' +
                '.maximize-game, ' +
                '.expand-game, ' +
                '[data-role="fullscreen-button"], ' +
                '[data-action="fullscreen"]'
              );
              
              if (fullscreenButton instanceof HTMLElement) {
                fullscreenButton.click();
              }

              // Add mutation observer to handle dynamic content
              const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  if (mutation.addedNodes.length) {
                    const newFullscreenButton = iframeDoc.querySelector(
                      '[data-test-id="game-fullscreen-button"], .fullscreen-button'
                    );
                    if (newFullscreenButton instanceof HTMLElement) {
                      newFullscreenButton.click();
                      observer.disconnect();
                    }
                  }
                });
              });

              observer.observe(iframeDoc.body, {
                childList: true,
                subtree: true
              });

              // Enhanced CSS for fullscreen
              const style = iframeDoc.createElement('style');
              style.textContent = `
                /* Base resets */
                * {
                  margin: 0 !important;
                  padding: 0 !important;
                  overflow: hidden !important;
                }

                /* Hide scrollbars */
                ::-webkit-scrollbar { 
                  display: none !important; 
                  width: 0 !important;
                  height: 0 !important;
                }

                /* Hide all UI elements except game */
                body > *:not(#game-container):not(.game-container):not(#game-wrapper):not(.game-wrapper):not(script):not(style):not(.game):not(.slot-container):not([class*="game-"]):not([id*="game-"]) {
                  display: none !important;
                }

                /* Game container styles */
                #game-container, .game-container, #game-wrapper, .game-wrapper,
                [class*="game-container"], [class*="game-wrapper"],
                [id*="game-container"], [id*="game-wrapper"],
                .slot-container, .slot-wrapper, .casino-game-container,
                [class*="slot-"], [class*="casino-game-"] {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  max-width: 100vw !important;
                  max-height: 100vh !important;
                  transform: none !important;
                  border: none !important;
                  border-radius: 0 !important;
                  background: #000 !important;
                  z-index: 2147483647 !important;
                }

                /* Ensure iframes take full space */
                iframe {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  border: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  z-index: 2147483647 !important;
                }

                /* Force fullscreen on common game elements */
                .game, .game-frame, .game-area, .game-view,
                .slot-game, .slot-view, .casino-game,
                [class*="game-"], [class*="slot-"], [class*="casino-"] {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  max-width: none !important;
                  max-height: none !important;
                  transform: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  border: none !important;
                }
              `;
              iframeDoc.head.appendChild(style);

              // Force body to be fullscreen
              iframeDoc.body.style.cssText = `
                margin: 0 !important;
                padding: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                overflow: hidden !important;
                background: #000 !important;
              `;
            }
          } catch (e) {
            console.warn('Could not modify iframe content:', e);
          }
        }, 2000);

        // Listen for messages from the iframe
        const handleMessage = (event: MessageEvent) => {
          console.log('Received message from iframe:', event.data);
          // Handle any responses or events from the game
          if (event.data.type === 'gameFullscreenResponse' || 
              event.data.action === 'fullscreenResponse' ||
              event.data.status === 'fullscreen') {
            console.log('Game responded to fullscreen request');
          }
        };

        window.addEventListener('message', handleMessage);
        return () => {
          window.removeEventListener('message', handleMessage);
        };
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