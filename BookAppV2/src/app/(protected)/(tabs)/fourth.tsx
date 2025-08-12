import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "@/utils/context/authContext";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function FourthScreen() {
    const router = useRouter();
    const authState = useContext(AuthContext);

    return (
        <ThemedView>
            <ThemedText>Fourth Screen</ThemedText>
            <Pressable
                onPress={() => {
                    router.back();
                }}
            >
                <ThemedText>Back</ThemedText>
            </Pressable>
            <Pressable onPress={authState.logOut}>
                <ThemedText>Log Out!</ThemedText>
            </Pressable>
        </ThemedView>
    );
}
