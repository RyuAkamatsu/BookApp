import { Stack } from 'expo-router';

export default function ProtectedLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="[bookId]"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
} 