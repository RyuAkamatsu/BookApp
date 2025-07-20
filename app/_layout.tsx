import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/styling/theme';

export default function RootLayout() {

    return (
        <ThemeProvider>
            <AuthProvider>
            <StatusBar style="auto" />
                <Stack>
                    <Stack.Screen
                        name="(auth)"
                        options={{
                            animation: "none",
                        }}
                    />
                    <Stack.Screen
                        name="(protected)"
                        options={{
                            headerShown: false,
                            animation: "none",
                        }}
                    />
                </Stack>
            </AuthProvider>
        </ThemeProvider>
    );
}
