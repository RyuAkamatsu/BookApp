import { Pressable } from "react-native";
import { Link } from "expo-router";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ModalWithStackScreen() {
    return (
        <ThemedView>
            <ThemedText>Modal With Stack Screen</ThemedText>
            <Link href="/modal-with-stack/nested" push asChild>
                <Pressable>
                    <ThemedText>Push to /modal-with-stack/nested</ThemedText>
                </Pressable>
            </Link>
        </ThemedView>
    );
}
