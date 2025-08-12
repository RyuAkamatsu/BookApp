import { Pressable } from "react-native";
import { Link } from "expo-router";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function SecondNestedScreen() {
    return (
        <ThemedView>
            <ThemedText>Second Nested Screen</ThemedText>
            <Link href="/second/also-nested" push asChild>
                <Pressable>
                    <ThemedText>Push to /second/also-nested"</ThemedText>
                </Pressable>
            </Link>
        </ThemedView>
    );
}
