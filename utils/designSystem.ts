// Design System - Consistent styling across the app
export const designSystem = {
  // Colors
  colors: {
    // Primary colors
    primary: '#00635D',
    primaryLight: '#4A9B96',
    primaryDark: '#004A45',
    
    // Background colors
    background: '#F9F7F4',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F3F0',
    
    // Text colors
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textMuted: '#CCCCCC',
    
    // Accent colors
    accent: '#F4B942',
    accentLight: '#F7C96B',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    
    // Border colors
    border: '#E5E5E5',
    borderLight: '#F0F0F0',
  },
  
  // Typography
  typography: {
    // Font sizes
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
    },
    
    // Font weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },
  
  // Border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  
  // Component sizes
  components: {
    button: {
      height: {
        sm: 36,
        md: 44,
        lg: 52,
      },
      padding: {
        sm: { horizontal: 12, vertical: 8 },
        md: { horizontal: 16, vertical: 12 },
        lg: { horizontal: 20, vertical: 16 },
      },
    },
    
    input: {
      height: 44,
      padding: { horizontal: 16, vertical: 12 },
    },
    
    card: {
      padding: 16,
      borderRadius: 16,
    },
    
    header: {
      height: 60,
      padding: { horizontal: 20, vertical: 16 },
    },
  },
};

// Common styles
export const commonStyles = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background,
  },
  
  // Header styles
  header: {
    backgroundColor: designSystem.colors.surface,
    paddingHorizontal: designSystem.spacing['2xl'],
    paddingBottom: designSystem.spacing.xl,
    borderBottomLeftRadius: designSystem.borderRadius['2xl'],
    borderBottomRightRadius: designSystem.borderRadius['2xl'],
    ...designSystem.shadows.md,
  },
  
  headerTitle: {
    fontSize: designSystem.typography.fontSize['3xl'],
    fontWeight: designSystem.typography.fontWeight.bold,
    color: designSystem.colors.textPrimary,
    marginBottom: designSystem.spacing.xs,
  },
  
  headerSubtitle: {
    fontSize: designSystem.typography.fontSize.base,
    color: designSystem.colors.textSecondary,
    lineHeight: designSystem.typography.lineHeight.normal * designSystem.typography.fontSize.base,
  },
  
  // Card styles
  card: {
    backgroundColor: designSystem.colors.surface,
    borderRadius: designSystem.borderRadius.lg,
    padding: designSystem.spacing.lg,
    ...designSystem.shadows.md,
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: designSystem.colors.primary,
    borderRadius: designSystem.borderRadius.md,
    paddingVertical: designSystem.spacing.md,
    paddingHorizontal: designSystem.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...designSystem.shadows.sm,
  },
  
  primaryButtonText: {
    color: designSystem.colors.surface,
    fontSize: designSystem.typography.fontSize.base,
    fontWeight: designSystem.typography.fontWeight.semibold,
  },
  
  secondaryButton: {
    backgroundColor: designSystem.colors.surfaceSecondary,
    borderRadius: designSystem.borderRadius.md,
    paddingVertical: designSystem.spacing.md,
    paddingHorizontal: designSystem.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  
  secondaryButtonText: {
    color: designSystem.colors.primary,
    fontSize: designSystem.typography.fontSize.base,
    fontWeight: designSystem.typography.fontWeight.semibold,
  },
  
  // Text styles
  title: {
    fontSize: designSystem.typography.fontSize['2xl'],
    fontWeight: designSystem.typography.fontWeight.bold,
    color: designSystem.colors.textPrimary,
    lineHeight: designSystem.typography.lineHeight.tight * designSystem.typography.fontSize['2xl'],
  },
  
  subtitle: {
    fontSize: designSystem.typography.fontSize.lg,
    fontWeight: designSystem.typography.fontWeight.semibold,
    color: designSystem.colors.textSecondary,
    lineHeight: designSystem.typography.lineHeight.normal * designSystem.typography.fontSize.lg,
  },
  
  body: {
    fontSize: designSystem.typography.fontSize.base,
    color: designSystem.colors.textPrimary,
    lineHeight: designSystem.typography.lineHeight.normal * designSystem.typography.fontSize.base,
  },
  
  caption: {
    fontSize: designSystem.typography.fontSize.sm,
    color: designSystem.colors.textSecondary,
    lineHeight: designSystem.typography.lineHeight.normal * designSystem.typography.fontSize.sm,
  },
  
  // Layout styles
  section: {
    marginBottom: designSystem.spacing['2xl'],
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
};