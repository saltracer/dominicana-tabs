
import React, { useMemo, memo } from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useTheme } from './ThemeProvider';
import { Colors } from '../constants/Colors';

interface HtmlRendererProps {
  htmlContent: string;
  maxLines?: number;
  style?: any;
}

// Memoized component to prevent unnecessary re-renders
const MemoizedRenderHtml = memo(RenderHtml);

// Static styles that don't depend on theme
const staticTagsStyles = {
  p: {
    marginBottom: 4,
    lineHeight: 18,
  },
  strong: {
    fontWeight: 'bold' as const,
  },
  em: {
    fontStyle: 'italic' as const,
  },
  br: {
    lineHeight: 18,
  },
  ul: {
    marginLeft: 16,
    marginBottom: 8,
  },
  ol: {
    marginLeft: 16,
    marginBottom: 8,
  },
  li: {
    marginBottom: 2,
  },
};

const systemFonts = ['Georgia', 'System'];

const HtmlRenderer = memo(function HtmlRenderer({ 
  htmlContent, 
  maxLines, 
  style 
}: HtmlRendererProps) {
  const { width } = useWindowDimensions();
  const { colorScheme } = useTheme();

  if (!htmlContent) {
    return null;
  }

  // Memoize theme-dependent styles to prevent recreation on every render
  const themeStyles = useMemo(() => {
    const theme = colorScheme ?? 'light';
    return {
      tagsStyles: {
        ...staticTagsStyles,
        a: {
          color: Colors[theme].primary,
          textDecorationLine: 'underline' as const,
        },
        blockquote: {
          marginLeft: 16,
          paddingLeft: 8,
          borderLeftWidth: 3,
          borderLeftColor: Colors[theme].primary,
          fontStyle: 'italic' as const,
        },
      },
      baseStyle: {
        color: Colors[theme].text,
        fontSize: 14,
        lineHeight: 18,
        ...style,
      },
    };
  }, [colorScheme, style]);

  // Memoize renderersProps to prevent recreation
  const renderersProps = useMemo(() => ({
    text: {
      numberOfLines: maxLines,
    },
  }), [maxLines]);

  return (
    <MemoizedRenderHtml
      contentWidth={width}
      source={{ html: htmlContent }}
      tagsStyles={themeStyles.tagsStyles}
      systemFonts={systemFonts}
      baseStyle={themeStyles.baseStyle}
      renderersProps={renderersProps}
      // Ignore unsupported CSS properties but preserve content
      ignoredDomTags={['style', 'script']}
      defaultTextProps={{
        allowFontScaling: false,
      }}
      // Disable CSS parsing that causes warnings
      enableExperimentalMarginCollapsing={false}
      // Remove customCSSRules that were causing native style property warnings
    />
  );
});

export default HtmlRenderer;
