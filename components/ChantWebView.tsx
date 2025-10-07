import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../contexts/AuthContext';
import { UserLiturgyPreferencesService } from '../services/UserLiturgyPreferencesService';
import { getGabcFileInfo, mapUserPreferenceToNotationType } from '../services/GabcMapping';
import { ChantService } from '../services/ChantService';

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

    // Show the user's chant notation preference
    const notationType = preferences.chant_notation || 'dominican';
    
    return generateChantPreferenceHtml(notationType, chantName, gabcContent);
  }, [loading, preferences, gabcLoading, gabcContent]);

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

// Generate HTML to display chant preference information
function generateChantPreferenceHtml(notationType: string, chantName?: string, gabcContent?: string | null): string {
  // const notationLabels: Record<string, string> = {
  //   'dominican': 'Dominican Variation',
  //   'solesmes': 'Solesmes Variation', 
  //   'simple': 'Simple Variation'
  // };

  // const label = notationLabels[notationType] || 'Dominican Variation';
  
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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chant Preferences</title>
      <style>
        body {
          margin: 0;
          padding: 16px;
          font-family: 'Times New Roman', serif;
          background-color: transparent;
          line-height: 1.4;
          height: auto;
          overflow: visible;
        }
        
        .chant-info {
          text-align: center;
          color: #666;
          font-size: 14px;
          padding: 8px;
          border-top: 1px solid #eee;
          margin-top: 8px;
          min-height: auto;
          height: auto;
          overflow: visible;
        }
        
        .notation-label {
          font-weight: bold;
          color: #333;
        }
        
        .chant-name {
          font-style: italic;
          color: #888;
          font-size: 12px;
          display: block;
          margin-top: 4px;
        }
        
        .content-container {
          height: auto;
          min-height: auto;
          overflow: visible;
          padding: 8px 0;
        }
        
        .file-info {
          font-size: 12px;
          color: #888;
          margin-top: 4px;
        }
        
        .file-name {
          font-family: monospace;
          background-color: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
        }
        
        .gabc-content {
          margin-top: 16px;
          border-top: 1px solid #eee;
          padding-top: 12px;
        }
        
        .gabc-header {
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
          font-size: 12px;
        }
        
        .gabc-text {
          font-family: monospace;
          font-size: 10px;
          background-color: #f8f8f8;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ddd;
          white-space: pre-wrap;
          word-wrap: break-word;
          color: #333;
          line-height: 1.2;
          margin: 0;
          height: auto;
          overflow: visible;
        }
      </style>
    </head>
      <body>
        <div class="content-container">
          ${gabcContent ? `
              <pre class="gabc-text">${fileName} - ${gabcContent}</pre>
          ` : ''}
        </div>
        <script>
          function sendHeight() {
            const height = document.body.scrollHeight;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'contentHeight',
              height: height
            }));
          }
          
          // Send height when content loads
          if (document.readyState === 'complete') {
            sendHeight();
          } else {
            window.addEventListener('load', sendHeight);
          }
          
          // Also send height after a short delay to ensure content is fully rendered
          setTimeout(sendHeight, 100);
        </script>
      </body>
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
