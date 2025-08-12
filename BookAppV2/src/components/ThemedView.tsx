import { View, type ViewProps } from 'react-native';
import { useContext } from 'react';
import { ThemeContext } from '@/utils/context/themeContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { paperTheme } = useContext(ThemeContext);

  const backgroundColor = paperTheme.colors.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
