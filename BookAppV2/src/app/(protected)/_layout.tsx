import { ThemedView } from "@/components/ThemedView";
import { AuthContext } from "@/utils/context/authContext";
import { Redirect, Stack } from "expo-router";
import { useContext } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "react-native-paper";
import { SearchBar } from "@/components/SearchBar";
import { Book } from "@/utils/service/bookService";

function CustomHeader() {
    const theme = useTheme();
    const authContext = useContext(AuthContext);

    // Handle book selection
    const handleBookSelect = (book: Book) => {
        console.log('Selected book:', book);
        // TODO: Navigate to book details or add to library
    };

    // Handle camera option
    const handleCameraOption = () => {
        console.log('Camera option selected');
        // TODO: Implement camera functionality
    };

    return (
        <ThemedView style={styles.header}>
            {/* Search Bar - 80% width */}
            <View style={styles.searchContainer}>
                <SearchBar
                    onBookSelect={handleBookSelect}
                    onCameraOption={handleCameraOption}
                    style={styles.searchBar}
                />
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
        marginRight: 12,
    },
    searchBar: {
        flex: 1,
    },
    userContainer: {
        flex: 0.2, // 20% width
        alignItems: 'center',
        justifyContent: 'center',
    },
});
