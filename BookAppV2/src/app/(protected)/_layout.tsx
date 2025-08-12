import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AuthContext } from "@/utils/context/authContext";
import { Redirect, Stack } from "expo-router";
import { useContext } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "react-native-paper";

function CustomHeader() {
    const theme = useTheme();
    const authContext = useContext(AuthContext);

    return (
        <ThemedView style={styles.header}>
            {/* Search Bar - 80% width */}
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons 
                    name="magnify" 
                    size={20} 
                    color={theme.colors.onSurface} 
                    style={styles.searchIcon}
                />
                <ThemedText style={styles.searchText}>Search for a book</ThemedText>
            </View>
            
            {/* User Component - 20% width */}
            <View style={styles.userContainer}>
                <Pressable onPress={() => console.log('User profile pressed')}>
                    {authContext.isLoggedIn ? (
                        <MaterialCommunityIcons 
                            name="account-circle" 
                            size={32} 
                            color={theme.colors.primary} 
                        />
                    ) : (
                        <MaterialCommunityIcons 
                            name="account-circle-outline" 
                            size={32} 
                            color={theme.colors.onSurface} 
                        />
                    )}
                </Pressable>
            </View>
        </ThemedView>
    );
}

export default function ProtectedLayout() {
    const authState = useContext(AuthContext);

    if (!authState.isReady) {
        return null;
    }

    if (!authState.isLoggedIn) {
        return <Redirect href="/login" />;
    }

    return (
        <Stack>
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: true,
                    header: () => <CustomHeader />
                }}
            />
        </Stack>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 60,
    },
    searchContainer: {
        flex: 0.8, // 80% width
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchText: {
        flex: 1,
        fontSize: 16,
        opacity: 0.7,
    },
    userContainer: {
        flex: 0.2, // 20% width
        alignItems: 'center',
        justifyContent: 'center',
    },
});
