// Cozy Book Corner Theme
export const theme = {
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

// Book corner specific styles
export const bookCornerStyles = {
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
};
