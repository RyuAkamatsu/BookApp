import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/hooks/useAuth';

export default function RootLayout() {
    useFrameworkReady();

    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="+not-found" />
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
                <Stack.Screen name="manual-book-lookup" />
            </Stack>
            <StatusBar style="auto" />
        </AuthProvider>
    );
}
