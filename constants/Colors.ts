const tintColorLight = '#8B0000';
const tintColorDark = '#DAA520';

export const Colors = {
  light: {
    // Primary liturgical colors
    // primary: '#8B0000', // Liturgical red
    primary: '#8C1515', // Liturgical red from the lovable Dominicana
    secondary: '#4B0082', // Royal purple
    accent: '#DAA520', // Liturgical gold
    
    // Background and surface colors
    background: '#F7F6F2', // Soft grey 247, 246, 242
    lightBackground: '#FAFAFA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    offWhiteCard: '#F8F7F3',
    
    // Text colors
    text: '#2F2F2F', // Charcoal
    textSecondary: '#666666',
    textMuted: '#999999',
    textOnRed: '#FFFFFF',
    
    // Status colors
    success: '#2E7D32',
    warning: '#F57C00',
    error: '#D32F2F',
    info: '#1976D2',
    
    // Border and divider colors
    border: '#E0E0E0',
    divider: '#BDBDBD',
    
    // Highlight colors for annotations
    highlight: {
      yellow: '#FFEB3B',
      green: '#4CAF50',
      blue: '#2196F3',
      pink: '#E91E63',
      red: '#F44336',
      // Background variants with opacity
      yellowBg: 'rgba(255, 235, 59, 0.3)',
      greenBg: 'rgba(76, 175, 80, 0.3)',
      blueBg: 'rgba(33, 150, 243, 0.3)',
      pinkBg: 'rgba(233, 30, 99, 0.3)',
      redBg: 'rgba(244, 67, 54, 0.3)',
    },
    
    // Liturgical season colors
    advent: '#4B0082', // Purple
    christmas: '#FFFFFF', // White
    ordinary: '#2E7D32', // Green
    lent: '#6A1B9A', // Violet
    holyWeek: '#6A1B9A', // Violet
    octaveOfEaster: '#FFFFFF', // White
    easter: '#FFFFFF', // White
    pentecost: '#FF6F00', // Orange/Red

    liturgicalRed: '#B42025',
    
    // Dominican-specific colors
    dominicanBlack: '#000000',
    dominicanWhite: '#FFFFFF',
    dominicanGold: '#DAA520',
    dominicanRed: '#B42025',

    alwaysBlack: '#000000',
    alwaysWhite: '#FFFFFF',
    
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    // Primary liturgical colors
    // primary: '#9C0000', // Liturgical red for dark mode
    primary: '#B85450', // Liturgical red from the lovable Dominicana
    secondary: '#9C27B0', // Lighter purple
    accent: '#FFD700', // Bright gold
    
    // Background and surface colors
    background: '#000000',
    lightBackground: '#1A1A1A',
    surface: '#201D1D',
    card: '#151515',
    offWhiteCard: '#393939',
    // card: '#000000',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#AAAAAA',
    textOnRed: '#FFFFFF',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    
    // Border and divider colors
    border: '#535353',
    divider: '#616161',
    
    // Highlight colors for annotations (same as light mode)
    highlight: {
      yellow: '#FFEB3B',
      green: '#4CAF50',
      blue: '#2196F3',
      pink: '#E91E63',
      red: '#F44336',
      // Background variants with opacity (slightly higher for dark mode)
      yellowBg: 'rgba(255, 235, 59, 0.4)',
      greenBg: 'rgba(76, 175, 80, 0.4)',
      blueBg: 'rgba(33, 150, 243, 0.4)',
      pinkBg: 'rgba(233, 30, 99, 0.4)',
      redBg: 'rgba(244, 67, 54, 0.4)',
    },
    
    // Liturgical season colors (adjusted for dark mode)
    advent: '#9C27B0', // Lighter purple
    christmas: '#FFFFFF', // White
    ordinary: '#4CAF50', // Green
    lent: '#BA68C8', // Lighter violet
    holyWeek: '#BA68C8', // Lighter Violet
    octaveOfEaster: '#FFFFFF', // White
    easter: '#FFFFFF', // White
    pentecost: '#FF9800', // Orange

    liturgicalRed: '#B42025',
    
    // Dominican-specific colors
    dominicanBlack: '#FFFFFF', // Inverted for dark mode
    dominicanWhite: '#000000',
    dominicanGold: '#FFD700',
    dominicanRed: '#B42025',

    alwaysBlack: '#000000',
    alwaysWhite: '#FFFFFF',

    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Helper function to get liturgical season color
export const getLiturgicalColor = (season: string, isDark: boolean = false) => {
  const theme = isDark ? Colors.dark : Colors.light;
  
  switch (season.toLowerCase()) {
    case 'advent':
      return theme.advent;
    case 'christmas':
      return theme.christmas;
    case 'ordinary':
      return theme.ordinary;
    case 'ordinary time':
      return theme.ordinary;
    case 'lent':
      return theme.lent;
    case 'holy week':
      return theme.holyWeek;
    case 'octave of easter':
      return theme.octaveOfEaster;
    case 'easter':
      return theme.easter;
    case 'pentecost':
      return theme.pentecost;
    default:
      return theme.primary;
  }
};

// Helper function to get feast day color based on rank
export const getFeastColor = (rank: string, isDark: boolean = false) => {
  const theme = isDark ? Colors.dark : Colors.light;
  
  switch (rank.toLowerCase()) {
    case 'solemnity':
      return theme.primary;
    case 'feast':
      return theme.secondary;
    case 'memorial':
      return theme.accent;
    case 'optional':
      return theme.textSecondary;
    default:
      return theme.text;
  }
};

// Helper function to convert LiturgicalColor enum values to hex colors
export const getLiturgicalColorHex = (liturgicalColor: string, isDark: boolean = false): string => {
  const theme = isDark ? Colors.dark : Colors.light;
  
  // First, handle liturgical color names (case-insensitive)
  switch (liturgicalColor.toLowerCase()) {
    case 'red':
      return theme.liturgicalRed || '#B42025'; // Use theme color or fallback
    case 'white':
      return '#FFFFFF';
    case 'green':
      return theme.ordinary || '#4CAF50'; // Use theme green or fallback
    case 'purple':
      return theme.advent || '#9C27B0'; // Use theme purple or fallback
    case 'rose':
      return '#E91E63'; // Rose pink
    case 'gold':
      return theme.dominicanGold || '#DAA520'; // Use theme gold or fallback
  }
  
  // If not a liturgical color, try to handle as season name
  switch (liturgicalColor.toLowerCase()) {
    case 'advent':
      return theme.advent;
    case 'christmas':
      return theme.christmas;
    case 'ordinary':
      return theme.ordinary;
    case 'ordinary time':
      return theme.ordinary;
    case 'lent':
      return theme.lent;
    case 'holy week':
        return theme.holyWeek;
    case 'octave of easter':
        return theme.octaveOfEaster;
    case 'easter':
        return theme.easter;
    case 'pentecost':
        return theme.pentecost;
    default:
        return theme.primary;
  }
};

// Helper function to adjust liturgical color brightness for progress bars
export function adjustLiturgicalColorBrightness(
  hexColor: string, 
  isDarkMode: boolean
): string {
  // Smarter brightness adjustment based on base color
  // Ensures good contrast for all liturgical colors
  
  // Parse hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate brightness
  const brightness = (r + g + b) / 3;
  const isLightColor = brightness > 127;
  
  // Apply adjustment based on brightness and theme
  let factor: number;
  if (isDarkMode) {
    factor = isLightColor ? 1.5 : 1.3; // Lighten more for light colors
  } else {
    factor = brightness > 127 ? 0.6 : 0.5; // Darken more for light colors
  }
  
  const newR = Math.min(255, Math.max(0, Math.floor(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.floor(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.floor(b * factor)));
  
  // Convert back to hex with zero-padding
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Alternative: Use semi-transparent black/white overlay for contrast
export function getProgressColorOverlay(
  baseColor: string,
  isDarkMode: boolean
): string {
  // Return white for dark base colors, black for light base colors
  const isWhite = baseColor.toLowerCase() === '#ffffff';
  const isGold = baseColor.toLowerCase().includes('ffd');
  
  if (isWhite || isGold) {
    // Light colors need dark overlay
    return isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.6)';
  } else {
    // Dark colors need light overlay
    return isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.7)';
  }
}
