import { useContext, useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { AuthContext } from "@/utils/context/authContext";
import { ThemeContext } from '@/utils/context/themeContext';
import { LoginCredentials } from "@/utils/service/authService";

import { useTheme, TextInput, Button, ActivityIndicator } from "react-native-paper";

export default function LoginScreen() {
    const { logIn, isLoggingIn, loginError } = useContext(AuthContext);
    const themeContext = useContext(ThemeContext);

    const theme = useTheme();

    const [credentials, setCredentials] = useState<LoginCredentials>({
        username: '',
        password: ''
    });

    const handleLogin = () => {
        logIn(credentials);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.primary }]}>
                Login Screen
            </Text>
            <View style={styles.form}>
                <TextInput
                    label="Username"
                    value={credentials.username}
                    onChangeText={(text) => setCredentials({ ...credentials, username: text })}
                    style={styles.input}
                    mode="outlined"
                />

                <TextInput
                    label="Password"
                    value={credentials.password}
                    onChangeText={(text) => setCredentials({ ...credentials, password: text })}
                    secureTextEntry
                    style={styles.input}
                    mode="outlined"
                />

                {loginError && (
                    <Text style={styles.errorText}>
                        Login failed. Please check your credentials.
                    </Text>
                )}

                <Button
                    mode="contained"
                    onPress={handleLogin}
                    style={styles.button}
                    disabled={isLoggingIn}
                >
                    {isLoggingIn ? (
                        <ActivityIndicator animating={true} color={theme.colors.onPrimary} />
                    ) : (
                        "Log In"
                    )}
                </Button>

                <Button
                    mode="outlined"
                    onPress={() => {
                        setCredentials({ username: 'demo', password: 'password123' });
                        setTimeout(() => logIn({ username: 'demo', password: 'password123' }), 100);
                    }}
                    style={[styles.button, styles.quickLoginButton]}
                    disabled={isLoggingIn}
                >
                    Quick Login (Demo)
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
        paddingVertical: 8,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    quickLoginButton: {
        marginTop: 8,
    }
});
