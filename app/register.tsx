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
import { registerUser, signInWithGoogle, signInWithFacebook, signInWithApple } from '@/utils/firebase';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { designSystem, commonStyles } from '@/utils/designSystem';

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuth();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): { isValid: boolean; message: string } => {
        if (password.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters long' };
        }
        if (!/[A-Z]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!/[a-z]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one lowercase letter' };
        }
        if (!/\d/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one number' };
        }
        return { isValid: true, message: '' };
    };

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            Alert.alert('Error', passwordValidation.message);
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const result = await registerUser(email, password, username);
            if (result.success && result.user) {
                setUser(result.user);
                router.replace('/(tabs)/library');
            } else {
                Alert.alert('Registration Failed', result.error);
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
                Alert.alert('Registration Failed', result.error);
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
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join our reading community</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Display Name</Text>
                            <View style={styles.inputWrapper}>
                                <User size={20} color={designSystem.colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Enter your display name"
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

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
                            <Text style={styles.passwordHint}>
                                At least 8 characters with uppercase, lowercase, and number
                            </Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputWrapper}>
                                <Lock size={20} color={designSystem.colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm your password"
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeIcon}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} color={designSystem.colors.textSecondary} />
                                    ) : (
                                        <Eye size={20} color={designSystem.colors.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[commonStyles.primaryButton, styles.registerButton, loading && styles.disabledButton]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text style={commonStyles.primaryButtonText}>
                                {loading ? 'Creating Account...' : 'Create Account'}
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
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/login')}>
                                <Text style={styles.linkText}>Sign In</Text>
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
    passwordHint: {
        fontSize: designSystem.typography.fontSize.xs,
        color: designSystem.colors.textSecondary,
        fontStyle: 'italic',
    },
    registerButton: {
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