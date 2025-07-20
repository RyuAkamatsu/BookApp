import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

import { router } from 'expo-router';
import { loginUser, signInWithGoogle, signInWithFacebook, signInWithApple } from '@/utils/firebase/firebase';
import { useAuth } from '@/hooks/useAuth';
import { syncDatabaseWithFirebase } from '@/utils/firebase/syncDatabase';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { useTheme, getCommonStyles } from '@/styling/theme';

export default function LoginScreen() {
    const { theme } = useTheme();
    const commonStyles = getCommonStyles(theme);

    const { setUser } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const result = await loginUser(username, password);
            if (result.success && result.user) {
                setUser(result.user);
                
                // Sync database with Firebase
                const syncResult = await syncDatabaseWithFirebase(result.user.uid);
                if (syncResult.success && syncResult.booksSynced && syncResult.booksSynced > 0) {
                    Alert.alert('Sync Complete', syncResult.message);
                }
                
                router.replace('/(tabs)/library');
            } else {
                Alert.alert('Login Failed', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDevBypass = async () => {
        if (__DEV__) {
            setLoading(true);
            try {
                const result = await createMockUser();
                if (result.success && result.user) {
                    setUser(result.user);
                    Alert.alert('Dev Login', `Logged in as ${result.username}`);
                    router.replace('/(tabs)/library');
                } else {
                    Alert.alert('Dev Login Failed', result.error);
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to create dev user');
            } finally {
                setLoading(false);
            }
        }
    };
    const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
        setLoading(true);
        try {
            let result;
            switch (provider) {
                case 'google':
                    result = await signInWithGoogle();
                    break;
                case 'facebook':
                    result = await signInWithFacebook();
                    break;
                case 'apple':
                    result = await signInWithApple();
                    break;
            }
            
            if (result.success && result.user) {
                setUser(result.user);
                router.replace('/(tabs)/library');
            } else {
                Alert.alert('Login Failed', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue your reading journey</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <View style={styles.inputWrapper}>
                        <User size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Enter your username"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputWrapper}>
                        <Lock size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            {showPassword ? (
                                <EyeOff size={20} color={theme.colors.textSecondary} />
                            ) : (
                                <Eye size={20} color={theme.colors.textSecondary} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[commonStyles.primaryButton, styles.loginButton, loading && styles.disabledButton]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={commonStyles.primaryButtonText}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialButtons}>
                    <TouchableOpacity
                        style={[styles.socialButton, styles.googleButton]}
                        onPress={() => handleSocialLogin('google')}
                        disabled={loading}
                    >
                        <Text style={styles.socialButtonText}>Google</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.socialButton, styles.facebookButton]}
                        onPress={() => handleSocialLogin('facebook')}
                        disabled={loading}
                    >
                        <Text style={styles.socialButtonText}>Facebook</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.socialButton, styles.appleButton]}
                        onPress={() => handleSocialLogin('apple')}
                        disabled={loading}
                    >
                        <Text style={[styles.socialButtonText, { color: theme.colors.surface }]}>Apple</Text>
                    </TouchableOpacity>
                </View>

                {__DEV__ && (
                    <TouchableOpacity
                        style={[styles.devButton, loading && styles.disabledButton]}
                        onPress={handleDevBypass}
                        disabled={loading}
                    >
                        <Text style={styles.devButtonText}>
                            🚀 Dev Bypass (Create Mock User)
                        </Text>
                    </TouchableOpacity>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/register')}>
                        <Text style={styles.linkText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex           : 1,
        backgroundColor: theme.colors.background,
    },
    scrollContainer: {
        flexGrow      : 1,
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: theme.spacing['2xl'],
        paddingVertical  : theme.spacing['4xl'],
    },
    header: {
        alignItems  : 'center',
        marginBottom: theme.spacing['4xl'],
    },
    title: {
        fontSize    : theme.typography.fontSize['4xl'],
        fontWeight  : theme.typography.fontWeight.bold,
        color       : theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize : theme.typography.fontSize.base,
        color    : theme.colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        gap: theme.spacing.xl,
    },
    inputContainer: {
        gap: theme.spacing.sm,
    },
    label: {
        fontSize  : theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semibold,
        color     : theme.colors.textPrimary,
    },
    inputWrapper: {
        flexDirection    : 'row',
        alignItems       : 'center',
        borderWidth      : 1,
        borderColor      : theme.colors.border,
        borderRadius     : theme.borderRadius.md,
        backgroundColor  : theme.colors.surface,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical  : theme.spacing.md,
    },
    inputIcon: {
        marginRight: theme.spacing.md,
    },
    input: {
        flex    : 1,
        fontSize: theme.typography.fontSize.base,
        color   : theme.colors.textPrimary,
    },
    eyeIcon: {
        padding: theme.spacing.xs,
    },
    loginButton: {
        marginTop: theme.spacing.lg,
    },
    disabledButton: {
        backgroundColor: theme.colors.textMuted,
    },
    divider: {
        flexDirection : 'row',
        alignItems    : 'center',
        marginVertical: theme.spacing.xl,
    },
    dividerLine: {
        flex           : 1,
        height         : 1,
        backgroundColor: theme.colors.border,
    },
    dividerText: {
        marginHorizontal: theme.spacing.lg,
        fontSize        : theme.typography.fontSize.sm,
        color           : theme.colors.textSecondary,
    },
    socialButtons: {
        gap: theme.spacing.md,
    },
    socialButton: {
        paddingVertical: theme.spacing.lg,
        borderRadius   : theme.borderRadius.md,
        alignItems     : 'center',
        borderWidth    : 1,
    },
    googleButton: {
        backgroundColor: theme.colors.surface,
        borderColor    : theme.colors.border,
    },
    facebookButton: {
        backgroundColor: '#1877F2',
        borderColor    : '#1877F2',
    },
    appleButton: {
        backgroundColor: theme.colors.textPrimary,
        borderColor    : theme.colors.textPrimary,
    },
    socialButtonText: {
        fontSize  : theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semibold,
        color     : theme.colors.textPrimary,
    },
    footer: {
        flexDirection : 'row',
        justifyContent: 'center',
        marginTop     : theme.spacing['2xl'],
    },
    footerText: {
        fontSize: theme.typography.fontSize.sm,
        color   : theme.colors.textSecondary,
    },
    linkText: {
        fontSize  : theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semibold,
        color     : theme.colors.primary,
    },
    devButton: {
        backgroundColor: '#FF6B35',
        borderRadius   : theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems     : 'center',
        marginTop      : theme.spacing.sm,
        borderWidth    : 2,
        borderColor    : '#FF6B35',
    },
    devButtonText: {
        color     : theme.colors.surface,
        fontSize  : theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semibold,
    },
});