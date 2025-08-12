import { Pressable } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "@/utils/context/themeContext";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ThemeTestScreen() {
    const { toggleTheme, isDark } = useContext(ThemeContext);

    return (
        <ThemedView>
            <ThemedText type="title">Theme Test Screen</ThemedText>
            <ThemedText>Current theme: {isDark ? 'Dark' : 'Light'}</ThemedText>
            <Pressable
                onPress={toggleTheme}
                style={{
                    marginTop: 20,
                    padding: 10,
                    backgroundColor: '#0a7ea4',
                    borderRadius: 5,
                }}
            >
                <ThemedText style={{ color: 'white' }}>Toggle Theme</ThemedText>
            </Pressable>
        </ThemedView>
    );
}
