import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { ChantResource } from '@/types/compline-types';

interface GabcWebViewRendererProps {
  chantResource: ChantResource;
  width?: number;
  height?: number;
  style?: any;
  theme?: 'light' | 'dark';
  enableWebView?: boolean;
}

interface RenderingState {
  status: 'loading' | 'rendering' | 'complete' | 'error';
  progress: number;
  error?: string;
}

export const GabcWebViewRenderer: React.FC<GabcWebViewRendererProps> = ({
  chantResource,
  width,
  height,
  style,
  theme = 'light',
  enableWebView = true
}) => {
  const webViewRef = useRef<WebView>(null);
  const [renderingState, setRenderingState] = useState<RenderingState>({
    status: 'loading',
    progress: 0
  });
  const [svgCache, setSvgCache] = useState<Map<string, string>>(new Map());

  // Generate cache key for this chant
  const cacheKey = `${chantResource.id}-${theme}-${width || 'default'}`;

  // Check if we have cached SVG
  const cachedSvg = svgCache.get(cacheKey);

  // Get optimal width for rendering
  const getOptimalWidth = useCallback(() => {
    const screenWidth = Dimensions.get('window').width;
    return Math.min(width || screenWidth - 32, 800);
  }, [width]);

  // Handle WebView messages
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'rendering-progress':
          setRenderingState(prev => ({
            ...prev,
            status: 'rendering',
            progress: data.progress
          }));
          break;
          
        case 'rendering-complete':
          setRenderingState(prev => ({
            ...prev,
            status: 'complete',
            progress: 100
          }));
          // Cache the SVG
          if (data.svg) {
            setSvgCache(prev => new Map(prev.set(cacheKey, data.svg)));
          }
          break;
          
        case 'rendering-error':
          setRenderingState(prev => ({
            ...prev,
            status: 'error',
            error: data.error
          }));
          break;
          
        case 'library-loaded':
          setRenderingState(prev => ({
            ...prev,
            status: 'rendering',
            progress: 10
          }));
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  }, [cacheKey]);

  // Generate HTML template with exsurge.js
  const generateHTMLTemplate = useCallback(() => {
    const optimalWidth = getOptimalWidth();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Chant Renderer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
            color: ${theme === 'dark' ? '#ffffff' : '#000000'};
            overflow-x: hidden;
        }
        
        .chant-container {
            width: 100%;
            min-height: 200px;
            padding: 16px;
            background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
            border-radius: 8px;
        }
        
        .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 200px;
            text-align: center;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid ${theme === 'dark' ? '#333' : '#e0e0e0'};
            border-top: 3px solid ${theme === 'dark' ? '#ffffff' : '#8B4513'};
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error {
            color: #d32f2f;
            text-align: center;
            padding: 16px;
        }
        
        .progress-bar {
            width: 100%;
            height: 4px;
            background-color: ${theme === 'dark' ? '#333' : '#e0e0e0'};
            border-radius: 2px;
            overflow: hidden;
            margin: 16px 0;
        }
        
        .progress-fill {
            height: 100%;
            background-color: ${theme === 'dark' ? '#ffffff' : '#8B4513'};
            transition: width 0.3s ease;
        }
        
        /* Exsurge SVG styling */
        .exsurge-svg {
            width: 100%;
            height: auto;
            max-width: ${optimalWidth}px;
        }
        
        .exsurge-svg text {
            fill: ${theme === 'dark' ? '#ffffff' : '#000000'};
        }
        
        .exsurge-svg line {
            stroke: ${theme === 'dark' ? '#ffffff' : '#000000'};
        }
        
        .exsurge-svg path {
            fill: ${theme === 'dark' ? '#ffffff' : '#000000'};
        }
    </style>
</head>
<body>
    <div class="chant-container">
        <div id="loading-container" class="loading">
            <div class="loading-spinner"></div>
            <div>Loading chant notation...</div>
            <div class="progress-bar">
                <div id="progress-fill" class="progress-fill" style="width: 0%"></div>
            </div>
        </div>
        <div id="error-container" class="error" style="display: none;"></div>
        <div id="chant-output"></div>
    </div>

    <script>
        // Global variables
        let chantData = null;
        let currentTheme = '${theme}';
        let targetWidth = ${optimalWidth};
        let isLibraryLoaded = false;
        
        // Chant data from React Native
        const chantResource = ${JSON.stringify(chantResource)};
        
        // Progress tracking
        function updateProgress(percent) {
            const progressFill = document.getElementById('progress-fill');
            if (progressFill) {
                progressFill.style.width = percent + '%';
            }
            
            // Send progress to React Native
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'rendering-progress',
                    progress: percent
                }));
            }
        }
        
        // Error handling
        function showError(message) {
            const errorContainer = document.getElementById('error-container');
            const loadingContainer = document.getElementById('loading-container');
            
            if (errorContainer) {
                errorContainer.textContent = message;
                errorContainer.style.display = 'block';
            }
            
            if (loadingContainer) {
                loadingContainer.style.display = 'none';
            }
            
            // Send error to React Native
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'rendering-error',
                    error: message
                }));
            }
        }
        
        // Check if exsurge is available
        function checkExsurge() {
            if (typeof exsurge === 'undefined') {
                showError('Exsurge library not loaded. Please ensure exsurge.min.js is available.');
                return false;
            }
            return true;
        }
        
        // Render chant using exsurge.js
        function renderChant() {
            try {
                updateProgress(20);
                
                if (!checkExsurge()) {
                    return;
                }
                
                updateProgress(40);
                
                // Create ChantContext
                const ctxt = new exsurge.ChantContext();
                ctxt.theme = currentTheme;
                
                updateProgress(60);
                
                // Parse GABC and create mappings
                const gabcData = chantResource.data;
                const mappings = exsurge.Gabc.createMappingsFromSource(ctxt, gabcData);
                const score = new exsurge.ChantScore(ctxt, mappings, true);
                
                updateProgress(80);
                
                // Perform layout
                score.performLayout(ctxt, function() {
                    score.layoutChantLines(ctxt, targetWidth, function() {
                        try {
                            updateProgress(90);
                            
                            // Render to SVG
                            const svgNode = document.createElement('div');
                            const innerHtml = score.createDrawable(ctxt);
                            svgNode.innerHTML = innerHtml;
                            
                            // Hide loading, show result
                            const loadingContainer = document.getElementById('loading-container');
                            const chantOutput = document.getElementById('chant-output');
                            
                            if (loadingContainer) {
                                loadingContainer.style.display = 'none';
                            }
                            
                            if (chantOutput) {
                                chantOutput.appendChild(svgNode);
                            }
                            
                            updateProgress(100);
                            
                            // Send completion to React Native
                            if (window.ReactNativeWebView) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'rendering-complete,
                                    svg: svgNode.outerHTML
                                }));
                            }
                            
                        } catch (renderError) {
                            console.error('Error in final rendering:', renderError);
                            showError('Failed to render chant notation: ' + renderError.message);
                        }
                    });
                });
                
            } catch (error) {
                console.error('Error rendering chant:', error);
                showError('Failed to render chant: ' + error.message);
            }
        }
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', function() {
            updateProgress(10);
            
            // Check if exsurge is already loaded
            if (typeof exsurge !== 'undefined') {
                isLibraryLoaded = true;
                updateProgress(20);
                renderChant();
            } else {
                // Wait for exsurge to load
                const checkInterval = setInterval(() => {
                    if (typeof exsurge !== 'undefined') {
                        clearInterval(checkInterval);
                        isLibraryLoaded = true;
                        updateProgress(20);
                        
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'library-loaded'
                            }));
                        }
                        
                        renderChant();
                    }
                }, 100);
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    if (!isLibraryLoaded) {
                        clearInterval(checkInterval);
                        showError('Timeout waiting for exsurge library to load');
                    }
                }, 10000);
            }
        });
        
        // Handle theme changes
        function updateTheme(newTheme) {
            currentTheme = newTheme;
            document.body.style.backgroundColor = newTheme === 'dark' ? '#1a1a1a' : '#ffffff';
            document.body.style.color = newTheme === 'dark' ? '#ffffff' : '#000000';
            
            // Re-render if already rendered
            if (isLibraryLoaded) {
                const chantOutput = document.getElementById('chant-output');
                if (chantOutput) {
                    chantOutput.innerHTML = '';
                }
                renderChant();
            }
        }
        
        // Expose functions for external control
        window.updateTheme = updateTheme;
        window.rerender = renderChant;
    </script>
    
    <!-- Load exsurge.js -->
    <script src="file:///android_asset/exsurge.min.js"></script>
</body>
</html>
    `;
  }, [theme, chantResource, getOptimalWidth]);

  // Handle WebView errors
  const handleWebViewError = useCallback((error: any) => {
    console.error('WebView error:', error);
    setRenderingState(prev => ({
      ...prev,
      status: 'error',
      error: 'WebView failed to load'
    }));
  }, []);

  // Handle WebView load end
  const handleWebViewLoadEnd = useCallback(() => {
    console.log('WebView loaded successfully');
  }, []);

  // Don't render WebView if disabled or on unsupported platforms
  if (!enableWebView || Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackTitle}>
            {chantResource.metadata.source || 'Gregorian Chant'}
          </Text>
          <Text style={styles.fallbackMode}>
            Mode {chantResource.metadata.mode || 'Unknown'} • Clef: {chantResource.metadata.clef || 'c4'}
          </Text>
          <Text style={styles.fallbackInfo}>
            {chantResource.metadata.composer || 'Traditional'}
          </Text>
          <Text style={styles.fallbackNote}>
            Advanced rendering not available on this platform
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Loading/Error States */}
      {renderingState.status === 'loading' && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chant notation...</Text>
        </View>
      )}
      
      {renderingState.status === 'error' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to render chant</Text>
          <Text style={styles.errorSubtext}>{renderingState.error}</Text>
        </View>
      )}
      
      {/* WebView */}
      <WebView
        ref={webViewRef}
        testID="webview-renderer"
        source={{ html: generateHTMLTemplate() }}
        style={[
          styles.webView,
          { 
            width: width || '100%',
            height: height || 300,
            minHeight: 200
          }
        ]}
        onMessage={handleWebViewMessage}
        onError={handleWebViewError}
        onLoadEnd={handleWebViewLoadEnd}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webView: {
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 1,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  fallbackContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackMode: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  fallbackInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  fallbackNote: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
  },
});
