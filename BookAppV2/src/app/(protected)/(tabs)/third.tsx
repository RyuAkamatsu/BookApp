import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ThirdScreen() {
    const router = useRouter();

    return (
        <ThemedView>
            <ThemedText>Third Screen</ThemedText>
            <Pressable
                onPress={() => {
                    router.back();
                }}
            >
                <ThemedText>Back</ThemedText>
            </Pressable>
        </ThemedView>
    );
}
