import { useContext } from "react";
import { Pressable, Text, View } from "react-native";
import { AuthContext } from "@/utils/context/authContext";
import { ThemeContext } from '@/utils/context/themeContext';

import { useTheme } from "react-native-paper";

export default function LoginScreen() {
    const authContext = useContext(AuthContext);
    const themeContext = useContext(ThemeContext);

    const theme = useTheme();

    return (
        <View style={{ backgroundColor: theme.colors.background }}>
            <Text style={{ color: theme.colors.primary }}>
                Login Screen
            </Text>
            <Pressable onPress={authContext.logIn}>
                <Text>Log In!</Text>
            </Pressable>
        </View>
    );
}
