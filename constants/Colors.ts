const tintColorLight = '#8B0000';
const tintColorDark = '#DAA520';

export const Colors = {
  light: {
    // Primary liturgical colors
    primary: '#8B0000', // Liturgical red
    secondary: '#4B0082', // Royal purple
    accent: '#DAA520', // Liturgical gold
    
    // Background and surface colors
    background: '#F8F9FA', // Soft grey
    surface: '#FFFFFF',
    card: '#FAFAFA',
    
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
    
    // Liturgical season colors
    advent: '#4B0082', // Purple
    christmas: '#FFFFFF', // White
    ordinary: '#2E7D32', // Green
    lent: '#6A1B9A', // Violet
    easter: '#FFFFFF', // White
    pentecost: '#FF6F00', // Orange/Red

    liturgicalRed: '#B42025',
    
    // Dominican-specific colors
    dominicanBlack: '#000000',
    dominicanWhite: '#FFFFFF',
    dominicanGold: '#DAA520',
    dominicanRed: '#B42025',
    
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    // Primary liturgical colors
    primary: '#8B1111', // Liturgical red for dark mode
    secondary: '#9C27B0', // Lighter purple
    accent: '#FFD700', // Bright gold
    
    // Background and surface colors
    background: '#121212',
    surface: '#2E2E2E',
    card: '#3D3D3D',
    
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
    
    // Liturgical season colors (adjusted for dark mode)
    advent: '#9C27B0', // Lighter purple
    christmas: '#FFFFFF', // White
    ordinary: '#4CAF50', // Green
    lent: '#BA68C8', // Lighter violet
    easter: '#FFFFFF', // White
    pentecost: '#FF9800', // Orange

    liturgicalRed: '#B42025',
    
    // Dominican-specific colors
    dominicanBlack: '#FFFFFF', // Inverted for dark mode
    dominicanWhite: '#000000',
    dominicanGold: '#FFD700',
    dominicanRed: '#B42025',

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
    case 'lent':
      return theme.lent;
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
    case 'lent':
      return theme.lent;
    case 'easter':
      return theme.easter;
    case 'pentecost':
      return theme.pentecost;
    default:
      return theme.primary; // Fallback to primary color
  }
};
