import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { loginUser, signInWithGoogle, signInWithFacebook, signInWithApple } from '@/utils/firebase';
import { useAuth } from '@/hooks/useAuth';
import { syncDatabaseWithFirebase } from '@/utils/syncDatabase';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { designSystem, commonStyles } from '@/utils/designSystem';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const result = await loginUser(email, password);
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
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue your reading journey</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrapper}>
                                <Mail size={20} color={designSystem.colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Lock size={20} color={designSystem.colors.textSecondary} style={styles.inputIcon} />
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
                                        <EyeOff size={20} color={designSystem.colors.textSecondary} />
                                    ) : (
                                        <Eye size={20} color={designSystem.colors.textSecondary} />
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
                                <Text style={[styles.socialButtonText, { color: designSystem.colors.surface }]}>Apple</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/register')}>
                                <Text style={styles.linkText}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: designSystem.colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: designSystem.spacing['2xl'],
        paddingVertical: designSystem.spacing['4xl'],
    },
    header: {
        alignItems: 'center',
        marginBottom: designSystem.spacing['4xl'],
    },
    title: {
        fontSize: designSystem.typography.fontSize['4xl'],
        fontWeight: designSystem.typography.fontWeight.bold,
        color: designSystem.colors.textPrimary,
        marginBottom: designSystem.spacing.sm,
    },
    subtitle: {
        fontSize: designSystem.typography.fontSize.base,
        color: designSystem.colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        gap: designSystem.spacing.xl,
    },
    inputContainer: {
        gap: designSystem.spacing.sm,
    },
    label: {
        fontSize: designSystem.typography.fontSize.sm,
        fontWeight: designSystem.typography.fontWeight.semibold,
        color: designSystem.colors.textPrimary,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: designSystem.colors.border,
        borderRadius: designSystem.borderRadius.md,
        backgroundColor: designSystem.colors.surface,
        paddingHorizontal: designSystem.spacing.lg,
        paddingVertical: designSystem.spacing.md,
    },
    inputIcon: {
        marginRight: designSystem.spacing.md,
    },
    input: {
        flex: 1,
        fontSize: designSystem.typography.fontSize.base,
        color: designSystem.colors.textPrimary,
    },
    eyeIcon: {
        padding: designSystem.spacing.xs,
    },
    loginButton: {
        marginTop: designSystem.spacing.lg,
    },
    disabledButton: {
        backgroundColor: designSystem.colors.textMuted,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: designSystem.spacing.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: designSystem.colors.border,
    },
    dividerText: {
        marginHorizontal: designSystem.spacing.lg,
        fontSize: designSystem.typography.fontSize.sm,
        color: designSystem.colors.textSecondary,
    },
    socialButtons: {
        gap: designSystem.spacing.md,
    },
    socialButton: {
        paddingVertical: designSystem.spacing.lg,
        borderRadius: designSystem.borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
    },
    googleButton: {
        backgroundColor: designSystem.colors.surface,
        borderColor: designSystem.colors.border,
    },
    facebookButton: {
        backgroundColor: '#1877F2',
        borderColor: '#1877F2',
    },
    appleButton: {
        backgroundColor: designSystem.colors.textPrimary,
        borderColor: designSystem.colors.textPrimary,
    },
    socialButtonText: {
        fontSize: designSystem.typography.fontSize.base,
        fontWeight: designSystem.typography.fontWeight.semibold,
        color: designSystem.colors.textPrimary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: designSystem.spacing['2xl'],
    },
    footerText: {
        fontSize: designSystem.typography.fontSize.sm,
        color: designSystem.colors.textSecondary,
    },
    linkText: {
        fontSize: designSystem.typography.fontSize.sm,
        fontWeight: designSystem.typography.fontWeight.semibold,
        color: designSystem.colors.primary,
    },
});