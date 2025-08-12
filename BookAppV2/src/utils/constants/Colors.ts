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
    "primary": "rgb(51, 92, 168)",
    "onPrimary": "rgb(255, 255, 255)",
    "primaryContainer": "rgb(216, 226, 255)",
    "onPrimaryContainer": "rgb(0, 26, 66)",
    "secondary": "rgb(171, 47, 83)",
    "onSecondary": "rgb(255, 255, 255)",
    "secondaryContainer": "rgb(255, 217, 222)",
    "onSecondaryContainer": "rgb(63, 0, 22)",
    "tertiary": "rgb(0, 104, 120)",
    "onTertiary": "rgb(255, 255, 255)",
    "tertiaryContainer": "rgb(167, 238, 255)",
    "onTertiaryContainer": "rgb(0, 31, 37)",
    "error": "rgb(186, 26, 26)",
    "onError": "rgb(255, 255, 255)",
    "errorContainer": "rgb(255, 218, 214)",
    "onErrorContainer": "rgb(65, 0, 2)",
    "background": "rgb(254, 251, 255)",
    "onBackground": "rgb(27, 27, 31)",
    "surface": "rgb(254, 251, 255)",
    "onSurface": "rgb(27, 27, 31)",
    "surfaceVariant": "rgb(225, 226, 236)",
    "onSurfaceVariant": "rgb(68, 71, 79)",
    "outline": "rgb(117, 119, 128)",
    "outlineVariant": "rgb(197, 198, 208)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(48, 48, 52)",
    "inverseOnSurface": "rgb(242, 240, 244)",
    "inversePrimary": "rgb(174, 198, 255)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(244, 243, 251)",
      "level2": "rgb(238, 238, 248)",
      "level3": "rgb(232, 234, 245)",
      "level4": "rgb(230, 232, 245)",
      "level5": "rgb(226, 229, 243)"
    },
    "surfaceDisabled": "rgba(27, 27, 31, 0.12)",
    "onSurfaceDisabled": "rgba(27, 27, 31, 0.38)",
    "backdrop": "rgba(46, 48, 56, 0.4)"
  }
}

const DarkTheme = {
  ...MD3DarkTheme,
  "colors": {
    ...MD3DarkTheme.colors,
    "primary": "rgb(74, 198, 255)",
    "onPrimary": "rgb(0, 46, 107)",
    "primaryContainer": "rgb(19, 68, 143)",
    "onPrimaryContainer": "rgb(216, 226, 255)",
    "secondary": "rgb(255, 178, 191)",
    "onSecondary": "rgb(102, 0, 39)",
    "secondaryContainer": "rgb(138, 19, 60)",
    "onSecondaryContainer": "rgb(255, 217, 222)",
    "tertiary": "rgb(83, 215, 241)",
    "onTertiary": "rgb(0, 54, 63)",
    "tertiaryContainer": "rgb(0, 78, 91)",
    "onTertiaryContainer": "rgb(167, 238, 255)",
    "error": "rgb(255, 180, 171)",
    "onError": "rgb(105, 0, 5)",
    "errorContainer": "rgb(147, 0, 10)",
    "onErrorContainer": "rgb(255, 180, 171)",
    "background": "rgb(27, 27, 31)",
    "onBackground": "rgb(227, 226, 230)",
    "surface": "rgb(27, 27, 31)",
    "onSurface": "rgb(227, 226, 230)",
    "surfaceVariant": "rgb(68, 71, 79)",
    "onSurfaceVariant": "rgb(197, 198, 208)",
    "outline": "rgb(142, 144, 153)",
    "outlineVariant": "rgb(68, 71, 79)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(227, 226, 230)",
    "inverseOnSurface": "rgb(48, 48, 52)",
    "inversePrimary": "rgb(51, 92, 168)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(34, 36, 42)",
      "level2": "rgb(39, 41, 49)",
      "level3": "rgb(43, 46, 56)",
      "level4": "rgb(45, 48, 58)",
      "level5": "rgb(48, 51, 62)"
    },
    "surfaceDisabled": "rgba(227, 226, 230, 0.12)",
    "onSurfaceDisabled": "rgba(227, 226, 230, 0.38)",
    "backdrop": "rgba(46, 48, 56, 0.4)"
  }
}
