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

// Light theme
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
    typography: lightTheme.typography,
  
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

// Book corner specific styles (updated to use theme)
export const getBookCornerStyles = (theme: typeof lightTheme) => ({
    // Paper-like backgrounds
    paper: {
        backgroundColor: theme.colors.surface,
        borderRadius   : theme.borderRadius.lg,
        ...theme.shadows.sm,
        borderWidth    : 1,
        borderColor    : theme.colors.border,
    },
  
    // Book spine effect
    bookSpine: {
        backgroundColor  : theme.colors.primary,
        borderRadius     : theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical  : theme.spacing.xs,
        ...theme.shadows.md,
    },
  
    // Vintage book cover
    vintageCover: {
        backgroundColor: theme.colors.bookSepia,
        borderRadius   : theme.borderRadius.lg,
        padding        : theme.spacing.md,
        ...theme.shadows.lg,
        borderWidth    : 2,
        borderColor    : theme.colors.bookGold,
    },
  
    // Cozy card
    cozyCard: {
        backgroundColor: theme.colors.surfaceSecondary,
        borderRadius   : theme.borderRadius.xl,
        padding        : theme.spacing.lg,
        ...theme.shadows.md,
        borderWidth    : 1,
        borderColor    : theme.colors.borderLight,
    },
  
    // Warm button
    warmButton: {
        backgroundColor  : theme.colors.primary,
        borderRadius     : theme.borderRadius.lg,
        paddingVertical  : theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        ...theme.shadows.sm,
    },
  
    // Book page effect
    bookPage: {
        backgroundColor: theme.colors.background,
        borderRadius   : theme.borderRadius.md,
        padding        : theme.spacing.md,
        borderWidth    : 1,
        borderColor    : theme.colors.border,
        ...theme.shadows.sm,
    },
});

// Legacy bookCornerStyles export for backward compatibility
export const bookCornerStyles = getBookCornerStyles(lightTheme);
