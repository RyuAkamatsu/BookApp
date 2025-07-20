import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import React, { createContext, useContext } from 'react';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme context
interface ThemeContextType {
    theme: typeof lightTheme;
    themeMode: ThemeMode;
    updateThemeMode: (mode: ThemeMode) => Promise<void>;
    isLoading: boolean;
    isDark: boolean;
    systemColorScheme: string | null | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 1. Define the design system structure (keys, not values)
const designSystemStructure = {
  colors: {},
  typography: {
    fontSize: {},
    fontWeight: {},
    lineHeight: {},
  },
  spacing: {},
  borderRadius: {},
  shadows: {},
  components: {},
};

// 2. Generate lightTheme and darkTheme based on the structure and values (merge from old designSystem and theme)
// (Keep your existing lightTheme and darkTheme definitions, but ensure they follow the designSystem structure)
export const lightTheme = {
    colors: {
        // Primary colors - warm browns and creams
        primary     : '#8B4513', // Saddle Brown
        primaryLight: '#A0522D', // Sienna
        primaryDark : '#654321', // Dark Brown
    
        // Background colors - creams and warm whites
        background         : '#FDF8F3', // Warm cream
        backgroundSecondary: '#F5F1EB', // Light cream
        backgroundTertiary : '#EFE8E0', // Muted cream
    
        // Surface colors - warm whites and creams
        surface         : '#FFFFFF',
        surfaceSecondary: '#FDF8F3',
        surfaceTertiary : '#F5F1EB',
    
        // Text colors - warm browns and dark colors
        textPrimary  : '#2D1810', // Dark brown
        textSecondary: '#5D4037', // Medium brown
        textTertiary : '#8D6E63', // Light brown
        textMuted    : '#A1887F', // Muted brown
    
        // Accent colors - warm reds and purples
        accent     : '#D2691E', // Chocolate
        accentLight: '#E67E22', // Carrot Orange
        accentDark : '#B8860B', // Dark Goldenrod
    
        // Book-inspired colors
        bookRed   : '#8B0000', // Dark Red
        bookPurple: '#4A148C', // Deep Purple
        bookGold  : '#DAA520', // Goldenrod
        bookSepia : '#704214', // Sepia
    
        // Status colors
        success: '#2E7D32', // Forest Green
        warning: '#F57C00', // Orange
        error  : '#D32F2F', // Red
        info   : '#1976D2', // Blue
    
        // Borders and dividers
        border     : '#D7CCC8', // Light brown border
        borderLight: '#EFEBE9', // Very light brown
        divider    : '#BCAAA4', // Medium brown divider
    },
  
    // Typography
    typography: {
        fontFamily: {
            primary  : 'Georgia, serif', // Classic serif for book feel
            secondary: 'Palatino, serif',
            accent   : 'Times New Roman, serif',
        },
        fontSize: {
            xs   : 12,
            sm   : 14,
            base : 16,
            lg   : 18,
            xl   : 20,
            '2xl': 24,
            '3xl': 30,
            '4xl': 36,
        },
        fontWeight: {
            light   : '300',
            normal  : '400',
            medium  : '500',
            semibold: '600',
            bold    : '700',
        },
        lineHeight: {
            tight: 1.2,
            normal: 1.4,
            relaxed: 1.6,
        },
    },
  
    // Spacing
    spacing: {
        xs   : 4,
        sm   : 8,
        md   : 16,
        lg   : 24,
        xl   : 32,
        '2xl': 48,
        '3xl': 64,
    },
  
    // Border radius
    borderRadius: {
        sm   : 4,
        md   : 8,
        lg   : 12,
        xl   : 16,
        '2xl': 24,
        full : 9999,
    },
  
    // Shadows
    shadows: {
        sm: {
            shadowColor  : '#2D1810',
            shadowOffset : { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius : 2,
            elevation    : 2,
        },
        md: {
            shadowColor  : '#2D1810',
            shadowOffset : { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius : 4,
            elevation    : 4,
        },
        lg: {
            shadowColor  : '#2D1810',
            shadowOffset : { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius : 8,
            elevation    : 8,
        },
    },
  
    // Gradients
    gradients: {
        primary   : ['#8B4513', '#A0522D'],
        background: ['#FDF8F3', '#F5F1EB'],
        book      : ['#D2691E', '#8B0000'],
        warm      : ['#F5F1EB', '#EFE8E0'],
    },
};

// Dark theme
export const darkTheme = {
    colors: {
        // Primary colors - warm browns and creams (adjusted for dark)
        primary     : '#D2691E', // Chocolate (lighter for dark mode)
        primaryLight: '#E67E22', // Carrot Orange
        primaryDark : '#8B4513', // Saddle Brown
    
        // Background colors - dark grays and browns
        background         : '#1A1A1A', // Dark gray
        backgroundSecondary: '#2D2D2D', // Medium dark gray
        backgroundTertiary : '#404040', // Lighter dark gray
    
        // Surface colors - dark surfaces
        surface         : '#2D2D2D',
        surfaceSecondary: '#404040',
        surfaceTertiary : '#525252',
    
        // Text colors - light colors for dark background
        textPrimary  : '#FFFFFF', // White
        textSecondary: '#E0E0E0', // Light gray
        textTertiary : '#BDBDBD', // Medium gray
        textMuted    : '#9E9E9E', // Muted gray
    
        // Accent colors - warm colors for dark mode
        accent     : '#FF8C42', // Orange
        accentLight: '#FFA726', // Light orange
        accentDark : '#E67E22', // Dark orange
    
        // Book-inspired colors (adjusted for dark)
        bookRed   : '#FF6B6B', // Light red
        bookPurple: '#9C27B0', // Purple
        bookGold  : '#FFD700', // Gold
        bookSepia : '#D7CCC8', // Light sepia
    
        // Status colors (adjusted for dark)
        success: '#4CAF50', // Green
        warning: '#FF9800', // Orange
        error  : '#F44336', // Red
        info   : '#2196F3', // Blue
    
        // Borders and dividers (dark)
        border     : '#404040', // Dark gray border
        borderLight: '#525252', // Medium gray
        divider    : '#616161', // Light gray divider
    },
  
    // Typography (same as light)
    typography: { ...lightTheme.typography },
  
    // Spacing (same as light)
    spacing: lightTheme.spacing,
  
    // Border radius (same as light)
    borderRadius: lightTheme.borderRadius,
  
    // Shadows (adjusted for dark)
    shadows: {
        sm: {
            shadowColor  : '#000000',
            shadowOffset : { width: 0, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius : 2,
            elevation    : 2,
        },
        md: {
            shadowColor  : '#000000',
            shadowOffset : { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius : 4,
            elevation    : 4,
        },
        lg: {
            shadowColor  : '#000000',
            shadowOffset : { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius : 8,
            elevation    : 8,
        },
    },
  
    // Gradients (adjusted for dark)
    gradients: {
        primary   : ['#D2691E', '#E67E22'],
        background: ['#1A1A1A', '#2D2D2D'],
        book      : ['#FF8C42', '#FF6B6B'],
        warm      : ['#2D2D2D', '#404040'],
    },
};

// Theme storage utilities
const THEME_MODE_KEY = 'bookapp_theme_mode';

export const getStoredThemeMode = async (): Promise<ThemeMode> => {
    try {
        const storedMode = await AsyncStorage.getItem(THEME_MODE_KEY);
        return (storedMode as ThemeMode) || 'system';
    } catch (error) {
        console.error('Error getting stored theme mode:', error);
        return 'system';
    }
};

export const setStoredThemeMode = async (mode: ThemeMode): Promise<void> => {
    try {
        await AsyncStorage.setItem(THEME_MODE_KEY, mode);
    } catch (error) {
        console.error('Error setting stored theme mode:', error);
    }
};

// Theme Provider Component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = React.useState<ThemeMode>('system');
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const loadThemeMode = async () => {
            const storedMode = await getStoredThemeMode();
            setThemeMode(storedMode);
            setIsLoading(false);
        };
        loadThemeMode();
    }, []);

    const updateThemeMode = async (mode: ThemeMode) => {
        setThemeMode(mode);
        await setStoredThemeMode(mode);
    };

    // Determine the actual theme based on mode and system preference
    const getActualTheme = () => {
        if (themeMode === 'system') {
            return systemColorScheme === 'dark' ? darkTheme : lightTheme;
        }
        return themeMode === 'dark' ? darkTheme : lightTheme;
    };

    const theme = getActualTheme();
    const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

    const contextValue: ThemeContextType = {
        theme,
        themeMode,
        updateThemeMode,
        isLoading,
        isDark,
        systemColorScheme,
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

// Theme context hook
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Legacy theme export for backward compatibility
export const theme = lightTheme;

// 3. Refactor commonStyles to be a function that takes the theme as an argument
export const getCommonStyles = (theme: typeof lightTheme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing['2xl'],
    paddingBottom: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius['2xl'],
    borderBottomRightRadius: theme.borderRadius['2xl'],
    ...theme.shadows.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize['2xl'],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.lg,
  },
  body: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
  },
  caption: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
  },
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
