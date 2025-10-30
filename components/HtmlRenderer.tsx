
import React, { useMemo, memo } from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useTheme } from './ThemeProvider';
import { Colors } from '../constants/Colors';

type ThemeKey = 'light' | 'dark';

interface HtmlRendererProps {
  htmlContent: string;
  maxLines?: number;
  style?: any;
  minimal?: boolean; // if true, rely on upstream RenderHTMLConfigProvider
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
const IGNORED_DOM_TAGS = ['style', 'script'] as const;
const DEFAULT_TEXT_PROPS = { allowFontScaling: false } as const;

// Global caches to ensure referential stability across many instances
const themeStylesCache: Record<string, { tagsStyles: any; baseStyle: any }> = {};
const renderersPropsCache = new Map<number | undefined, any>();

function getThemeStyles(theme: ThemeKey) {
  if (themeStylesCache[theme]) return themeStylesCache[theme];
  const styles = {
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
    },
  };
  themeStylesCache[theme] = styles;
  return styles;
}

function getRenderersProps(maxLines?: number) {
  if (renderersPropsCache.has(maxLines)) return renderersPropsCache.get(maxLines);
  const value = { text: { numberOfLines: maxLines } };
  renderersPropsCache.set(maxLines, value);
  return value;
}

const HtmlRenderer = memo(function HtmlRenderer({ 
  htmlContent, 
  maxLines, 
  style,
  minimal = false,
}: HtmlRendererProps) {
  const { width } = useWindowDimensions();
  const { colorScheme } = useTheme();

  if (!htmlContent) {
    return null;
  }

  // Memoize theme-dependent styles to prevent recreation on every render
  const theme = (colorScheme ?? 'light') as ThemeKey;
  const themeStyles = getThemeStyles(theme);

  // Memoize renderersProps to prevent recreation
  const renderersProps = getRenderersProps(maxLines);

  // Stable source object to prevent provider prop updates
  const source = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  // Memoize merged base style to prevent unnecessary re-renders
  const mergedBaseStyle = useMemo(() => {
    if (!style) return themeStyles.baseStyle;
    
    // If style is an array (React Native style array), flatten it into a single object
    let flattenedStyle: any = {};
    if (Array.isArray(style)) {
      style.forEach((s: any) => {
        if (s && typeof s === 'object') {
          flattenedStyle = { ...flattenedStyle, ...s };
        }
      });
    } else {
      flattenedStyle = style;
    }
    
    return { ...themeStyles.baseStyle, ...flattenedStyle };
  }, [themeStyles.baseStyle, style]);

  if (minimal) {
    return (
      <MemoizedRenderHtml
        contentWidth={width}
        source={source}
      />
    );
  }

  return (
    <MemoizedRenderHtml
      contentWidth={width}
      source={source}
      tagsStyles={themeStyles.tagsStyles}
      systemFonts={systemFonts}
      baseStyle={mergedBaseStyle}
      renderersProps={renderersProps}
      ignoredDomTags={IGNORED_DOM_TAGS as any}
      defaultTextProps={DEFAULT_TEXT_PROPS as any}
      enableExperimentalMarginCollapsing={false}
    />
  );
});

export default HtmlRenderer;
