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
              // Inject JavaScript to resize game container
              const script = iframeDoc.createElement('script');
              script.textContent = `
                function resizeGame() {
                  // First try to find the casino game container with its specific classes
                  const gameContainer = document.querySelector(
                    '.casino-game_holder__HIyq6.casino-game_bottomMenuEnabled__10Bnn[data-test="gameContainer"], ' +
                    '[class*="casino-game_holder"][class*="bottomMenuEnabled"]'
                  );

                  if (gameContainer) {
                    // Style the main container
                    Object.assign(gameContainer.style, {
                      position: 'fixed',
                      top: '0',
                      left: '0',
                      width: '100vw',
                      height: '100vh',
                      margin: '0',
                      padding: '0',
                      border: 'none',
                      zIndex: '2147483647'
                    });

                    // Find the frame holder
                    const frameHolder = gameContainer.querySelector(
                      '.casino-gamme_frameHolder__brthK, ' +
                      '[class*="casino-game_frameHolder"]'
                    );

                    if (frameHolder) {
                      Object.assign(frameHolder.style, {
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100vw',
                        height: '100vh',
                        margin: '0',
                        padding: '0',
                        border: 'none',
                        zIndex: '2147483647'
                      });

                      // Find the game holder and its iframe
                      const gameHolder = frameHolder.querySelector('#gameHolder');
                      if (gameHolder) {
                        Object.assign(gameHolder.style, {
                          position: 'fixed',
                          top: '0',
                          left: '0',
                          width: '100vw',
                          height: '100vh',
                          margin: '0',
                          padding: '0',
                          border: 'none',
                          zIndex: '2147483647'
                        });

                        // Style the iframe inside gameHolder
                        const gameIframe = gameHolder.querySelector('iframe');
                        if (gameIframe) {
                          Object.assign(gameIframe.style, {
                            position: 'fixed',
                            top: '0',
                            left: '0',
                            width: '100vw',
                            height: '100vh',
                            margin: '0',
                            padding: '0',
                            border: 'none',
                            transform: 'none',
                            transition: 'none',
                            zIndex: '2147483647'
                          });

                          // Try to access and style the iframe's content
                          try {
                            const iframeDoc = gameIframe.contentDocument || gameIframe.contentWindow?.document;
                            if (iframeDoc) {
                              const style = iframeDoc.createElement('style');
                              style.textContent = 'body, html { width: 100vw !important; height: 100vh !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; } * { margin: 0 !important; padding: 0 !important; }';
                              iframeDoc.head.appendChild(style);
                            }
                          } catch (e) {
                            console.warn('Could not style iframe content:', e);
                          }
                        }
                      }

                      // Hide all other elements
                      document.body.childNodes.forEach(node => {
                        if (node !== gameContainer && node.nodeType === 1) {
                          (node as HTMLElement).style.display = 'none';
                        }
                      });
                    }
                  } else {
                    // Fallback to generic selectors if specific structure not found
                    const containers = [
                      '#game-container',
                      '.game-container',
                      '#game-wrapper',
                      '.game-wrapper',
                      '.slot-container',
                      '[class*="game-container"]',
                      '[class*="slot-container"]',
                      '[id*="game-container"]'
                    ];

                    let fallbackContainer = null;
                    for (const selector of containers) {
                      const element = document.querySelector(selector);
                      if (element) {
                        fallbackContainer = element;
                        break;
                      }
                    }

                    if (fallbackContainer) {
                      Object.assign(fallbackContainer.style, {
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100vw',
                        height: '100vh',
                        maxWidth: '100vw',
                        maxHeight: '100vh',
                        margin: '0',
                        padding: '0',
                        border: 'none',
                        zIndex: '2147483647',
                        transform: 'none',
                        transition: 'none'
                      });

                      const gameElement = fallbackContainer.querySelector('iframe, canvas, [class*="game"], [class*="slot"]');
                      if (gameElement) {
                        Object.assign(gameElement.style, {
                          width: '100%',
                          height: '100%',
                          position: 'fixed',
                          top: '0',
                          left: '0',
                          margin: '0',
                          padding: '0',
                          border: 'none'
                        });
                      }
                    }
                  }
                }

                // Run immediately and on any window resize
                resizeGame();
                window.addEventListener('resize', resizeGame);

                // Rerun on dynamic content changes
                const observer = new MutationObserver(() => {
                  resizeGame();
                });
                observer.observe(document.body, {
                  childList: true,
                  subtree: true
                });

                // Intercept fullscreen requests
                document.addEventListener('fullscreenchange', resizeGame);
                document.addEventListener('webkitfullscreenchange', resizeGame);
                document.addEventListener('mozfullscreenchange', resizeGame);
                document.addEventListener('MSFullscreenChange', resizeGame);
              `;
              iframeDoc.head.appendChild(script);

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

                /* Force body to be fullscreen */
                body, html {
                  width: 100vw !important;
                  height: 100vh !important;
                  overflow: hidden !important;
                  background: #000 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }

                /* Main container styles */
                .casino-game_holder__HIyq6.casino-game_bottomMenuEnabled__10Bnn,
                [class*="casino-game_holder"][class*="bottomMenuEnabled"] {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  border: none !important;
                  z-index: 2147483647 !important;
                }

                /* Frame holder styles */
                .casino-gamme_frameHolder__brthK,
                [class*="casino-game_frameHolder"] {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  border: none !important;
                  z-index: 2147483647 !important;
                }

                /* Game holder styles */
                #gameHolder {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  border: none !important;
                  z-index: 2147483647 !important;
                }

                /* Game iframe styles */
                #gameHolder iframe {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  border: none !important;
                  transform: none !important;
                  transition: none !important;
                  z-index: 2147483647 !important;
                }

                /* Hide all other elements */
                body > *:not([class*="casino-game_holder"]):not(script):not(style) {
                  display: none !important;
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