import { Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function SecondScreen() {
    const router = useRouter();

    return (
        <ThemedView>
            <ThemedText>Second Screen</ThemedText>
            <Link href="/second/nested" push asChild>
                <Pressable>
                    <ThemedText>Push to /second/nested"</ThemedText>
                </Pressable>
            </Link>
            <Pressable onPress={() => { router.back(); }}>
                <ThemedText>Back</ThemedText>
            </Pressable>
        </ThemedView>
    );
}

/**
 * /index
 * /second (stack)
 *   /second/index
 *   /second/nested
 *   /second/also-nested
 * /third
 * /fourth
 */
