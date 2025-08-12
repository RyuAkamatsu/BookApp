import { Alert, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function IndexScreen() {
    const router = useRouter();
    const canGoBack = router.canGoBack();

    // https://reactnative.dev/docs/alert
    const handleOpenAlert = () => {
        Alert.alert("Warning!", "Are you sure you want to proceed?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Confirm",
                style: "destructive",
                onPress: () => {
                    console.log("Let's go!");
                },
            },
        ]);
    };

    return (
        <ThemedView>
            <ThemedText>Index Screen</ThemedText>
            <Link href="/home-nested" push asChild>
                <Pressable onPress={() => handleOpenAlert()}>
                    <ThemedText>Push to /home-nested</ThemedText>
                </Pressable>
            </Link>
            {canGoBack ? (
                <Pressable onPress={() => { router.back(); }}>
                    <ThemedText>Back</ThemedText>
                </Pressable>
            ) : null}
        </ThemedView>
    );
}
