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
        // Wait for iframe to be ready
        setTimeout(() => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              // Add styles to force game container to be fullscreen
              const style = iframeDoc.createElement('style');
              style.textContent = `
                body, html {
                  width: 100% !important;
                  height: 100% !important;
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
                  width: 100% !important;
                  height: 100% !important;
                  transform: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  border: none !important;
                  z-index: 2147483647 !important;
                }

                /* Target game iframes and canvases */
                iframe,
                canvas,
                [class*="game-canvas"],
                [id*="game-canvas"] {
                  width: 100% !important;
                  height: 100% !important;
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
              iframeDoc.head.appendChild(style);

              // Inject script to handle dynamic content and resizing
              const script = iframeDoc.createElement('script');
              script.textContent = `
                function forceGameFullscreen() {
                  // List of selectors to try
                  const selectors = [
                    '#gameHolder',
                    '#game-container',
                    '.game-container',
                    '[class*="game-container"]',
                    '[class*="casino-game"]',
                    '[class*="slot-container"]',
                    '[id*="game-container"]',
                    '[class*="game-holder"]',
                    '[class*="frameHolder"]',
                    '[class*="game_holder"]',
                    '[class*="game-frame"]',
                    '[class*="game_frame"]'
                  ];

                  // Try each selector
                  for (const selector of selectors) {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                      Object.assign(element.style, {
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        transform: 'none',
                        margin: '0',
                        padding: '0',
                        border: 'none',
                        zIndex: '2147483647'
                      });

                      // Also style any iframes or canvases inside
                      const gameElements = element.querySelectorAll('iframe, canvas, [class*="game-canvas"], [id*="game-canvas"]');
                      gameElements.forEach(gameElement => {
                        Object.assign(gameElement.style, {
                          width: '100%',
                          height: '100%',
                          position: 'fixed',
                          top: '0',
                          left: '0',
                          transform: 'none',
                          margin: '0',
                          padding: '0',
                          border: 'none',
                          zIndex: '2147483647'
                        });
                      });
                    });
                  }

                  // Hide all other elements
                  document.body.childNodes.forEach(node => {
                    if (node.nodeType === 1 && !selectors.some(selector => node.matches(selector))) {
                      if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
                        (node as HTMLElement).style.display = 'none';
                      }
                    }
                  });
                }

                // Run immediately and periodically
                forceGameFullscreen();
                setInterval(forceGameFullscreen, 1000);

                // Run on any DOM changes
                new MutationObserver(forceGameFullscreen).observe(document.body, {
                  childList: true,
                  subtree: true,
                  attributes: true
                });

                // Run on window resize
                window.addEventListener('resize', forceGameFullscreen);
              `;
              iframeDoc.head.appendChild(script);
            }
          } catch (e) {
            console.warn('Could not modify iframe content:', e);
          }
        }, 1000);
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
          onClick={() => {
            const iframe = iframeRef.current;
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage('clickFullscreen', '*');
            }
          }}
          className="rounded-md bg-black/50 p-1 text-white opacity-50 hover:opacity-100"
          title="Fullscreen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
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