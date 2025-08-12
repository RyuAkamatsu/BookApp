// GENERATE COLOUR PALETTES HERE: https://callstack.github.io/react-native-paper/docs/guides/theming#extending-the-theme

import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export {
    LightTheme,
    DarkTheme,
}

const LightTheme = {
  ...MD3LightTheme,
  "colors": {
    ...MD3LightTheme.colors,
    "primary": "rgb(0, 103, 129)",
    "onPrimary": "rgb(255, 255, 255)",
    "primaryContainer": "rgb(186, 234, 255)",
    "onPrimaryContainer": "rgb(0, 31, 41)",
    "secondary": "rgb(18, 110, 12)",
    "onSecondary": "rgb(255, 255, 255)",
    "secondaryContainer": "rgb(157, 248, 136)",
    "onSecondaryContainer": "rgb(0, 34, 0)",
    "tertiary": "rgb(123, 88, 0)",
    "onTertiary": "rgb(255, 255, 255)",
    "tertiaryContainer": "rgb(255, 222, 166)",
    "onTertiaryContainer": "rgb(39, 25, 0)",
    "error": "rgb(186, 26, 26)",
    "onError": "rgb(255, 255, 255)",
    "errorContainer": "rgb(255, 218, 214)",
    "onErrorContainer": "rgb(65, 0, 2)",
    "background": "rgb(251, 252, 254)",
    "onBackground": "rgb(25, 28, 29)",
    "surface": "rgb(251, 252, 254)",
    "onSurface": "rgb(25, 28, 29)",
    "surfaceVariant": "rgb(220, 228, 232)",
    "onSurfaceVariant": "rgb(64, 72, 76)",
    "outline": "rgb(112, 120, 125)",
    "outlineVariant": "rgb(192, 200, 204)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(46, 49, 50)",
    "inverseOnSurface": "rgb(239, 241, 243)",
    "inversePrimary": "rgb(95, 212, 254)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(238, 245, 248)",
      "level2": "rgb(231, 240, 244)",
      "level3": "rgb(223, 236, 240)",
      "level4": "rgb(221, 234, 239)",
      "level5": "rgb(216, 231, 237)"
    },
    "surfaceDisabled": "rgba(25, 28, 29, 0.12)",
    "onSurfaceDisabled": "rgba(25, 28, 29, 0.38)",
    "backdrop": "rgba(42, 50, 53, 0.4)"
  }
}

const DarkTheme = {
  ...MD3DarkTheme,
  "colors": {
    ...MD3DarkTheme.colors,
    "primary": "rgb(95, 212, 254)",
    "onPrimary": "rgb(0, 53, 68)",
    "primaryContainer": "rgb(0, 77, 98)",
    "onPrimaryContainer": "rgb(186, 234, 255)",
    "secondary": "rgb(130, 219, 111)",
    "onSecondary": "rgb(0, 58, 0)",
    "secondaryContainer": "rgb(0, 83, 0)",
    "onSecondaryContainer": "rgb(157, 248, 136)",
    "tertiary": "rgb(247, 189, 72)",
    "onTertiary": "rgb(65, 45, 0)",
    "tertiaryContainer": "rgb(93, 66, 0)",
    "onTertiaryContainer": "rgb(255, 222, 166)",
    "error": "rgb(255, 180, 171)",
    "onError": "rgb(105, 0, 5)",
    "errorContainer": "rgb(147, 0, 10)",
    "onErrorContainer": "rgb(255, 180, 171)",
    "background": "rgb(25, 28, 29)",
    "onBackground": "rgb(225, 227, 228)",
    "surface": "rgb(25, 28, 29)",
    "onSurface": "rgb(225, 227, 228)",
    "surfaceVariant": "rgb(64, 72, 76)",
    "onSurfaceVariant": "rgb(192, 200, 204)",
    "outline": "rgb(138, 146, 150)",
    "outlineVariant": "rgb(64, 72, 76)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(225, 227, 228)",
    "inverseOnSurface": "rgb(46, 49, 50)",
    "inversePrimary": "rgb(0, 103, 129)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(29, 37, 40)",
      "level2": "rgb(31, 43, 47)",
      "level3": "rgb(33, 48, 54)",
      "level4": "rgb(33, 50, 56)",
      "level5": "rgb(35, 54, 61)"
    },
    "surfaceDisabled": "rgba(225, 227, 228, 0.12)",
    "onSurfaceDisabled": "rgba(225, 227, 228, 0.38)",
    "backdrop": "rgba(42, 50, 53, 0.4)"
  }
}
