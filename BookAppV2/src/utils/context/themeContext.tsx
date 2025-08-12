import { createContext, PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { useColorScheme } from '@/utils/hooks/useColorScheme';
import { MD3Theme } from 'react-native-paper';
import { DarkTheme, LightTheme } from '@/utils/constants/Colors';

type ThemeState = {
    isDark: boolean,
    paperTheme: MD3Theme,
    toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeState>({
    isDark: false,
    paperTheme: LightTheme,
    toggleTheme: () => {}
});

type ThemeProviderProps = {
    children: ReactNode | ((themeState: ThemeState) => ReactNode);
};

export function ThemeProvider({ children }: ThemeProviderProps) {
    const colourScheme = useColorScheme();
    const [isDark, setIsDark] = useState(colourScheme === 'dark');

    useEffect(() => {
        setIsDark(colourScheme === 'dark');
    }, [colourScheme]);

    const toggleTheme = () => {
        console.log(`Current isDark Value: ${isDark}`);
        setIsDark(!isDark);
    };

    const paperTheme = isDark ? DarkTheme : LightTheme;
    console.log(`Current PaperTheme Value: ${paperTheme.colors.primary}`);

    const themeState: ThemeState = { isDark, paperTheme, toggleTheme };

    return (
        <ThemeContext.Provider value={themeState}>
            {typeof children === 'function' ? children(themeState) : children}
        </ThemeContext.Provider>
    );
}
