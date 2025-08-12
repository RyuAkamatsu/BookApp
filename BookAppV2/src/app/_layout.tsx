import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@context/authContext";
import { ThemeProvider } from '@/utils/context/themeContext';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
});

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                {({ paperTheme }) => (
                    <PaperProvider theme={paperTheme}>
                        <AuthProvider>
                            <StatusBar style="auto" hidden />
                            <Stack>
                                <Stack.Screen
                                    name="(protected)"
                                    options={{
                                        headerShown: false,
                                        animation: "none",
                                    }}
                                />
                                <Stack.Screen
                                    name="login"
                                    options={{
                                        animation: "none",
                                    }}
                                />
                            </Stack>
                        </AuthProvider>
                    </PaperProvider>
                )}
            </ThemeProvider>
        </QueryClientProvider>
    );
}
