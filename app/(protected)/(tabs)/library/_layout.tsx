import { Stack } from 'expo-router';

export default function LibraryLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="scan" />
            <Stack.Screen name="manual-book-lookup" />
        </Stack>
    );
}