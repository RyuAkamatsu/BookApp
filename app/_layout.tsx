import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/utils/theme';

export default function RootLayout() {
    useFrameworkReady();

    return (
        <ThemeProvider>
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)/index" />
                    <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
            </AuthProvider>
        </ThemeProvider>
    );
}
