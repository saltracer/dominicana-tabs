import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
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
        chant_notation: 'gregorian'
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
      return '<div style="padding: 20px; text-align: center;">Loading chant preferences...</div>';
    }

    // If chant notation is disabled, return empty content
    if (!preferences.chant_notation_enabled) {
      return '';
    }

    if (gabcLoading) {
      return '<div style="padding: 20px; text-align: center;">Loading GABC content...</div>';
    }

    // Show the user's chant notation preference
    const notationType = preferences.chant_notation || 'dominican';
    
    return generateChantPreferenceHtml(notationType, chantName, gabcContent);
  }, [loading, preferences, gabcLoading, gabcContent]);

  // Call onLoadEnd when content is ready
  React.useEffect(() => {
    if (!loading && preferences && onLoadEnd) {
      onLoadEnd();
    }
  }, [loading, preferences, onLoadEnd]);

  return (
    <View style={[styles.container, style]}>
      <div 
        style={styles.webContent}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </View>
  );
}

// Generate HTML to display chant preference information
function generateChantPreferenceHtml(notationType: string, chantName?: string, gabcContent?: string | null): string {
  const notationLabels: Record<string, string> = {
    'dominican': 'Dominican Variation',
    'solesmes': 'Solesmes Variation', 
    'simple': 'Simple Variation'
  };

  const label = notationLabels[notationType] || 'Dominican Variation';
  
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
    <div class="content-container">
      <div>
        <span class="notation-label">${notationType}</span> enabled<br/>
        <span class="chant-name">${chantName}</span>
      </div>
      ${fileInfo ? `
        <div class="file-info">
          <div>${description}</div>
          <div>File: <span class="file-name">${fileName}</span></div>
        </div>
      ` : ''}
      ${gabcContent ? `
        <div class="gabc-content">
          <div class="gabc-header">GABC Content:</div>
          <pre class="gabc-text">${gabcContent}</pre>
        </div>
      ` : ''}
    </div>
    <style>
      .chant-info {
        text-align: center;
        color: #666;
        font-size: 14px;
        padding: 8px;
        border-top: 1px solid #eee;
        margin-top: 8px;
        font-family: 'Times New Roman', serif;
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
        text-align: center;
        color: #666;
        font-size: 14px;
        font-family: 'Times New Roman', serif;
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
  `;
}

// Escape HTML characters for safe display
function escapeHtml(text: string | undefined | null): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const styles = StyleSheet.create({
  container: {
    minHeight: 80,
    height: 'auto',
  },
  webContent: {
    width: '100%',
    minHeight: 80,
    height: 'auto',
  },
});
