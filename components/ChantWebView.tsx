import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../contexts/AuthContext';
import { UserLiturgyPreferencesService } from '../services/UserLiturgyPreferencesService';
import { getGabcFileInfo, mapUserPreferenceToNotationType } from '../services/GabcMapping';
import { ChantService } from '../services/ChantService';
import { loadExsurgeLibrary } from '../lib/exsurge.min';

interface ChantWebViewProps {
  chantName?: string;
  style?: any;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
}

export default function ChantWebView({ 
  chantName,
  style, 
  onLoadEnd,
  onError 
}: ChantWebViewProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [gabcContent, setGabcContent] = React.useState<string | null>(null);
  const [gabcLoading, setGabcLoading] = React.useState(false);
  const [exsurgeLibrary, setExsurgeLibrary] = React.useState<string>('');

  // Load the exsurge library on mount
  React.useEffect(() => {
    loadExsurgeLibrary()
      .then(setExsurgeLibrary)
      .catch((error) => {
        console.error('Error loading exsurge library:', error);
      });
  }, []);

  // Load user preferences
  React.useEffect(() => {
    if (user) {
      UserLiturgyPreferencesService.getUserPreferencesWithCache(user.id)
        .then(({ cached, fresh }) => {
          if (cached) {
            setPreferences(cached);
            setLoading(false);
          }
          return fresh;
        })
        .then((freshPreferences) => {
          if (freshPreferences) {
            setPreferences(freshPreferences);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error loading chant preferences:', error);
          setLoading(false);
        });
    } else {
      // Default preferences for non-authenticated users
      setPreferences({
        chant_notation_enabled: true,
        chant_notation: 'dominican'
      });
      setLoading(false);
    }
  }, [user]);

  // Load GABC content when preferences and chantName are available
  React.useEffect(() => {
    if (!loading && preferences && chantName && preferences.chant_notation_enabled) {
      const loadGabcContent = async () => {
        setGabcLoading(true);
        try {
          const chantService = ChantService.getInstance();
          const content = await chantService.getMarianHymnGabc(chantName, preferences.chant_notation);
          setGabcContent(content);
        } catch (error) {
          console.error('Error loading GABC content:', error);
          setGabcContent(null);
        } finally {
          setGabcLoading(false);
        }
      };

      loadGabcContent();
    }
  }, [loading, preferences, chantName]);

  // Generate the HTML content based on user preferences
  const htmlContent = useMemo(() => {
    if (loading || !preferences) {
      return '<html><body><div style="padding: 20px; text-align: center;">Loading chant preferences...</div></body></html>';
    }

    // If chant notation is disabled, return empty content
    if (!preferences.chant_notation_enabled) {
      return '<html><body></body></html>';
    }

    if (gabcLoading) {
      return '<html><body><div style="padding: 20px; text-align: center;">Loading GABC content...</div></body></html>';
    }

    // Wait for exsurge library to load
    if (!exsurgeLibrary) {
      return '<html><body><div style="padding: 20px; text-align: center;">Loading chant library...</div></body></html>';
    }

    // Show the user's chant notation preference
    const notationType = preferences.chant_notation || 'dominican';
    
    return generateChantPreferenceHtml(notationType, chantName, gabcContent, exsurgeLibrary);
  }, [loading, preferences, gabcLoading, gabcContent, exsurgeLibrary]);

  const [webViewHeight, setWebViewHeight] = React.useState(80);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'contentHeight') {
        setWebViewHeight(Math.max(80, data.height + 20)); // Add padding
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html: htmlContent }}
        style={[styles.webview, { height: webViewHeight }]}
        onLoadEnd={onLoadEnd}
        onError={onError}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
      />
    </View>
  );
}

// Helper function to generate head scripts
function generateHeadScripts(exsurgeLib: string): string {
  return `
    <script>
      //t("loading the exsurge library");
      ${exsurgeLib}
      //alert("done loading the exsurge library")

      function sendHeight() {
        const height = document.body.scrollHeight;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'contentHeight',
          height: height
        }));
      }
      
      // Send height when content loads
      if (document.readyState === 'complete') {
        //alert('document ready state is complete');
        sendHeight();
      } else {
        //alert('document ready state is not complete');
        window.addEventListener('load', sendHeight);
      }

      // Check if exsurge is available
      if (window.exsurge) {
        //alert('exsurge library loaded');
      } else {
        //alert('exsurge library not loaded');
      }
      
      // Also send height after a short delay to ensure SVG is fully rendered
      setTimeout(sendHeight, 100);
      setTimeout(sendHeight, 500);
    </script>
  `;
}

// Helper function to generate styles
function generateStyles(): string {
  return `
    <style>
      body {
        margin: 0;
        padding: 16px;
        font-family: 'Times New Roman', serif;
        background-color: transparent;
        line-height: 1.4;
        overflow: visible;
      }
      
      #chant-container {
        width: 100%;
        overflow-x: auto;
        margin: 16px 0;
      }
      
      .chant-info {
        text-align: center;
        color: #666;
        font-size: 14px;
        padding: 8px;
        border-top: 1px solid #eee;
        margin-top: 8px;
      }
      
      .file-name {
        font-family: monospace;
        background-color: #f5f5f5;
        padding: 2px 4px;
        border-radius: 3px;
        color: #333;
      }
      
      .error-message {
        color: #d32f2f;
        padding: 16px;
        background-color: #ffebee;
        border-radius: 4px;
        border: 1px solid #ef5350;
        margin: 16px 0;
      }
    </style>
  `;
}

// Helper function to generate body content
function generateBodyContent(fileName: string): string {
  return `
    <body>
      <!-- Container for the rendered chant SVG -->
      <div id="chant-container">chant container text</div>
      
      ${fileName ? `
        <div class="chant-info">
          <span class="file-name">${fileName}</span>
        </div>
      ` : ''}
    </body>
  `;
}

// Helper function to generate the chant rendering script
function generateRenderingScript(gabcContent: string): string {
  return `
    <script>
      //alert('loading the chant container');
      (function() {
        // GABC content to render - using JSON.stringify for safe interpolation
        const gabcContent = ${JSON.stringify(gabcContent)};
        //alert('gabc content provided: ' + JSON.stringify(gabcContent));
        
        if (!gabcContent) {
          //alert('no gabc content provided');
          console.error('No GABC content provided');
          document.getElementById('chant-container').innerHTML = 
            '<p class="error-message">No chant content available</p>';
          sendHeight();
          return;
        }
        
        if (!window.exsurge) {
          //alert('exsurge library not loaded');
          console.error('exsurge library not loaded');
          document.getElementById('chant-container').innerHTML = 
            '<p class="error-message">Chant rendering library not loaded</p>';
          sendHeight();
          return;
        }
        
        try {
          // 1. Create a ChantContext with rendering settings
          //alert('creating a chant context');
          const ctxt = new exsurge.ChantContext();
          
          // Optional: Customize the context settings
          ctxt.lyricTextSize = 16;
          ctxt.dropCapTextSize = 48;
          ctxt.annotationTextSize = 12;
          
          // 2. Parse GABC and create mappings
          const mappings = exsurge.Gabc.createMappingsFromSource(ctxt, gabcContent);
          
          // 3. Create a ChantScore
          const score = new exsurge.ChantScore(ctxt, mappings, true);
          
          // 4. Get the container width for layout
          const containerWidth = document.getElementById('chant-container').clientWidth || 800;
          
          // 5. Perform layout and render (synchronous operations)
          score.performLayout(ctxt);
          score.layoutChantLines(ctxt, containerWidth - 32);
          
          // 6. Create SVG and insert into DOM
          const svgHtml = score.createSvg(ctxt);
          document.getElementById('chant-container').innerHTML = svgHtml;
          
          // 7. Send the new height to React Native
          sendHeight();
          
        } catch (error) {
          console.error('Error rendering chant:', error);
          document.getElementById('chant-container').innerHTML = 
            '<p class="error-message">Error rendering chant: ' + error.message + '</p>';
          sendHeight();
        }
      })();
    </script>
  `;
}

// Generate HTML to display chant preference information
function generateChantPreferenceHtml(notationType: string, chantName?: string, gabcContent?: string | null, exsurgeLib?: string): string {
  // Get GABC file information if chant name is provided
  let fileInfo = null;
  let fileName = '';
  let description = '';
  
  if (chantName) {
    const notationTypeEnum = mapUserPreferenceToNotationType(notationType);
    fileInfo = getGabcFileInfo(chantName, notationTypeEnum);
    if (fileInfo) {
      fileName = fileInfo.fileName;
      description = fileInfo.description;
    }
  }

  // Generate HTML parts
  const headScripts = generateHeadScripts(exsurgeLib || '');
  const styles = generateStyles();
  const bodyContent = generateBodyContent(fileName);
  const renderingScript = generateRenderingScript(gabcContent || '');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chant Rendering</title>
      ${headScripts}
      ${styles}
    </head>
    ${bodyContent}
    ${renderingScript}
    </html>
  `;
}


const styles = StyleSheet.create({
  container: {
    minHeight: 80,
    height: 'auto',
  },
  webview: {
    minHeight: 80,
    backgroundColor: 'transparent',
  },
});
