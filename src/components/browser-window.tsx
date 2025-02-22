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

                          // Try multiple approaches to trigger fullscreen
                          
                          // 1. Send postMessage to request fullscreen
                          try {
                            gameIframe.contentWindow.postMessage({ action: 'requestFullscreen' }, '*');
                            gameIframe.contentWindow.postMessage({ type: 'requestFullscreen' }, '*');
                            gameIframe.contentWindow.postMessage('requestFullscreen', '*');
                          } catch (e) {
                            console.warn('Could not send postMessage:', e);
                          }

                          // 2. Try to access and modify the iframe's content
                          try {
                            const iframeDoc = gameIframe.contentDocument || gameIframe.contentWindow?.document;
                            if (iframeDoc) {
                              // Add fullscreen styles
                              const style = iframeDoc.createElement('style');
                              style.textContent = 'body, html { width: 100vw !important; height: 100vh !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; } * { margin: 0 !important; padding: 0 !important; }';
                              iframeDoc.head.appendChild(style);

                              // Try to find and click fullscreen buttons
                              const fullscreenSelectors = [
                                '[data-test-id="game-fullscreen-button"]',
                                '.fullscreen-button',
                                '[class*="fullscreen"]',
                                '[id*="fullscreen"]',
                                'button[title*="fullscreen" i]',
                                'button[aria-label*="fullscreen" i]',
                                '[class*="maximize"]',
                                '[id*="maximize"]'
                              ];

                              // Function to click fullscreen buttons
                              function clickFullscreenButtons() {
                                for (const selector of fullscreenSelectors) {
                                  const buttons = iframeDoc.querySelectorAll(selector);
                                  buttons.forEach(button => {
                                    try {
                                      button.click();
                                      console.log('Clicked fullscreen button:', selector);
                                    } catch (e) {
                                      console.warn('Could not click button:', selector, e);
                                    }
                                  });
                                }
                              }

                              // Click buttons immediately and after a delay
                              clickFullscreenButtons();
                              setTimeout(clickFullscreenButtons, 1000);
                              setTimeout(clickFullscreenButtons, 2000);

                              // Add event listener for fullscreen messages
                              window.addEventListener('message', (event) => {
                                if (event.data && typeof event.data === 'object') {
                                  // Log all messages for debugging
                                  console.log('Received message:', event.data);
                                  
                                  // Check if the message indicates the game is ready
                                  if (event.data.type === 'gameReady' || 
                                      event.data.action === 'gameReady' || 
                                      event.data.status === 'ready') {
                                    // Try clicking fullscreen buttons again
                                    clickFullscreenButtons();
                                    
                                    // Send fullscreen request
                                    event.source.postMessage({ action: 'requestFullscreen' }, '*');
                                  }
                                }
                              });

                              // Inject script to handle fullscreen
                              const fullscreenScript = iframeDoc.createElement('script');
                              fullscreenScript.textContent = \`
                                // Function to request fullscreen
                                function requestFullscreen(element) {
                                  if (element.requestFullscreen) {
                                    element.requestFullscreen();
                                  } else if (element.webkitRequestFullscreen) {
                                    element.webkitRequestFullscreen();
                                  } else if (element.mozRequestFullScreen) {
                                    element.mozRequestFullScreen();
                                  } else if (element.msRequestFullscreen) {
                                    element.msRequestFullscreen();
                                  }
                                }

                                // Listen for fullscreen messages
                                window.addEventListener('message', function(event) {
                                  if (event.data && 
                                      (event.data.action === 'requestFullscreen' || 
                                       event.data.type === 'requestFullscreen' || 
                                       event.data === 'requestFullscreen')) {
                                    // Try to make the game container fullscreen
                                    const gameContainer = document.querySelector('#game-container') || 
                                                        document.querySelector('.game-container') ||
                                                        document.querySelector('[class*="game-container"]');
                                    if (gameContainer) {
                                      requestFullscreen(gameContainer);
                                    } else {
                                      requestFullscreen(document.documentElement);
                                    }
                                  }
                                });

                                // Send ready message
                                window.parent.postMessage({ type: 'gameReady' }, '*');
                              \`;
                              iframeDoc.body.appendChild(fullscreenScript);
                            }
                          } catch (e) {
                            console.warn('Could not modify iframe content:', e);
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

                // Run immediately and after delays to catch dynamic content
                resizeGame();
                setTimeout(resizeGame, 1000);
                setTimeout(resizeGame, 2000);
                setTimeout(resizeGame, 5000);

                // Rerun on dynamic content changes
                const observer = new MutationObserver(() => {
                  resizeGame();
                });
                observer.observe(document.body, {
                  childList: true,
                  subtree: true
                });

                // Intercept fullscreen changes
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

              // New script for opening game in new window
              script.textContent = `
                function openGameInNewWindow(gameUrl) {
                  const width = window.screen.width;
                  const height = window.screen.height;
                  const features = \`width=\${width},height=\${height},fullscreen=yes\`;
                  window.open(gameUrl, '_blank', features);
                }

                function findAndOpenGame() {
                  // First try to find the casino game container with its specific classes
                  const gameContainer = document.querySelector(
                    '.casino-game_holder__HIyq6.casino-game_bottomMenuEnabled__10Bnn[data-test="gameContainer"], ' +
                    '[class*="casino-game_holder"][class*="bottomMenuEnabled"]'
                  );

                  if (gameContainer) {
                    // Try to find the game iframe through the hierarchy
                    const frameHolder = gameContainer.querySelector(
                      '.casino-gamme_frameHolder__brthK, ' +
                      '[class*="casino-game_frameHolder"]'
                    );

                    if (frameHolder) {
                      const gameHolder = frameHolder.querySelector('#gameHolder');
                      if (gameHolder) {
                        const gameIframe = gameHolder.querySelector('iframe');
                        if (gameIframe && gameIframe.src) {
                          openGameInNewWindow(gameIframe.src);
                          return true;
                        }
                      }
                    }
                  }

                  // Fallback: try to find any game iframe
                  const iframes = document.querySelectorAll('iframe');
                  for (const iframe of iframes) {
                    if (iframe.src && (
                        iframe.src.includes('game') ||
                        iframe.src.includes('slot') ||
                        iframe.src.includes('casino')
                      )) {
                      openGameInNewWindow(iframe.src);
                      return true;
                    }
                  }

                  return false;
                }

                // Try to find and open the game automatically after a delay
                setTimeout(() => {
                  findAndOpenGame();
                }, 3000);

                // Add a message handler for manual trigger
                window.addEventListener('message', function(event) {
                  if (event.data === 'openGameInNewWindow') {
                    findAndOpenGame();
                  }
                });
              `;
              iframeDoc.head.appendChild(script);

              // New script for finding and clicking fullscreen button
              script.textContent = `
                function findAndClickFullscreenButton() {
                  // Common fullscreen button selectors
                  const buttonSelectors = [
                    // Direct fullscreen button selectors
                    'button.fullscreen',
                    'button[class*="fullscreen"]',
                    'div[class*="fullscreen"]',
                    '[data-test-id*="fullscreen"]',
                    '[class*="fullscreen-button"]',
                    '[id*="fullscreen"]',
                    // Generic button selectors that might be fullscreen
                    'button:has(svg)',
                    'button.icon-button',
                    '[role="button"]',
                    // Specific casino selectors
                    '.casino-controls button',
                    '.game-controls button',
                    '.controls-container button'
                  ];

                  // First try the main document
                  for (const selector of buttonSelectors) {
                    const buttons = document.querySelectorAll(selector);
                    for (const button of buttons) {
                      // Check if this looks like a fullscreen button
                      const buttonText = button.textContent?.toLowerCase() || '';
                      const buttonHTML = button.innerHTML.toLowerCase();
                      const isFullscreenButton = 
                        buttonText.includes('full') || 
                        buttonText.includes('screen') ||
                        buttonHTML.includes('full') ||
                        buttonHTML.includes('screen') ||
                        buttonHTML.includes('maximize') ||
                        button.className.toLowerCase().includes('full') ||
                        button.className.toLowerCase().includes('screen');

                      if (isFullscreenButton) {
                        try {
                          button.click();
                          console.log('Clicked fullscreen button:', button);
                          return true;
                        } catch (e) {
                          console.warn('Failed to click button:', e);
                        }
                      }
                    }
                  }

                  // Try to find and access game iframes
                  const iframes = document.querySelectorAll('iframe');
                  for (const iframe of iframes) {
                    try {
                      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                      if (iframeDoc) {
                        for (const selector of buttonSelectors) {
                          const buttons = iframeDoc.querySelectorAll(selector);
                          for (const button of buttons) {
                            const buttonText = button.textContent?.toLowerCase() || '';
                            const buttonHTML = button.innerHTML.toLowerCase();
                            const isFullscreenButton = 
                              buttonText.includes('full') || 
                              buttonText.includes('screen') ||
                              buttonHTML.includes('full') ||
                              buttonHTML.includes('screen') ||
                              buttonHTML.includes('maximize') ||
                              button.className.toLowerCase().includes('full') ||
                              button.className.toLowerCase().includes('screen');

                            if (isFullscreenButton) {
                              try {
                                button.click();
                                console.log('Clicked fullscreen button in iframe:', button);
                                return true;
                              } catch (e) {
                                console.warn('Failed to click button in iframe:', e);
                              }
                            }
                          }
                        }
                      }
                    } catch (e) {
                      console.warn('Failed to access iframe:', e);
                    }
                  }

                  return false;
                }

                // Try to click fullscreen button repeatedly
                function attemptFullscreen() {
                  if (!findAndClickFullscreenButton()) {
                    // If button not found, try again after a delay
                    setTimeout(attemptFullscreen, 1000);
                  }
                }

                // Start attempting to find and click fullscreen button
                attemptFullscreen();

                // Also try when any content changes
                const observer = new MutationObserver(() => {
                  findAndClickFullscreenButton();
                });

                observer.observe(document.body, {
                  childList: true,
                  subtree: true,
                  attributes: true,
                  characterData: true
                });

                // Listen for messages from parent
                window.addEventListener('message', function(event) {
                  if (event.data === 'clickFullscreen') {
                    findAndClickFullscreenButton();
                  }
                });
              `;
              iframeDoc.head.appendChild(script);

              // Add minimal CSS to ensure game is visible
              const gameStyle = iframeDoc.createElement('style');
              gameStyle.textContent = '/* Ensure game container is visible */ #gameHolder, [id*="game-container"], [class*="game-container"], [class*="casino-game"] { min-width: 100vw !important; min-height: 100vh !important; width: 100vw !important; height: 100vh !important; position: fixed !important; top: 0 !important; left: 0 !important; margin: 0 !important; padding: 0 !important; z-index: 2147483647 !important; } /* Ensure game iframe takes full space */ iframe { width: 100% !important; height: 100% !important; position: fixed !important; top: 0 !important; left: 0 !important; margin: 0 !important; padding: 0 !important; border: none !important; }';
              iframeDoc.head.appendChild(gameStyle);
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