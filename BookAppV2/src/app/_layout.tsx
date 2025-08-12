import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@context/authContext";
import { ThemeProvider } from '@/utils/context/themeContext';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
    return (
        <ThemeProvider>
            {({ paperTheme }) => (
                <PaperProvider theme={paperTheme}>
                    <AuthProvider>
                        <StatusBar style="auto" />
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
    );
}
