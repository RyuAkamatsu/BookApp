import { Alert, Modal, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function IndexScreen() {
    const router = useRouter();
    const canGoBack = router.canGoBack();
    const [modalVisible, setModalVisible] = useState(false);

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
            <Pressable onPress={() => handleOpenAlert()}>
                <ThemedText>Open Alert</ThemedText>
            </Pressable>
            <Pressable onPress={() => setModalVisible(true)}>
                <ThemedText>Open RN Modal</ThemedText>
            </Pressable>
            <Link href="/modal" push asChild>
                <Pressable>
                    <ThemedText>Open Router Modal</ThemedText>
                </Pressable>
            </Link>
            <Link href="/modal-with-stack" push asChild>
                <Pressable>
                    <ThemedText>Open Router Modal (Stack)</ThemedText>
                </Pressable>
            </Link>
            {/* https://reactnative.dev/docs/modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                // presentationStyle="pageSheet"
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <ThemedView>
                    <ThemedText>
                        A custom styled modal!
                    </ThemedText>
                    <Pressable onPress={() => { setModalVisible(false); }}>
                        <ThemedText>Close</ThemedText>
                    </Pressable>
                </ThemedView>
            </Modal>
        </ThemedView>
    );
}
