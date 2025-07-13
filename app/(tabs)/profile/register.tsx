import React, { useState, useEffect } from 'react';
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
import { registerUser } from '@/utils/firebase';
import { useAuth } from '@/hooks/useAuth';
import { checkFirstLoad, markFirstLoadComplete } from '@/utils/firstLoad';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(false);
    const { setUser } = useAuth();

    useEffect(() => {
        const checkFirstLoadStatus = async () => {
            const firstLoad = await checkFirstLoad();
            setIsFirstLoad(firstLoad);
        };
        checkFirstLoadStatus();
    }, []);

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
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)' };
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
                // Mark first load as complete
                await markFirstLoadComplete();
                // Remove skipped registration flag if it exists
                try {
                    await AsyncStorage.removeItem('bookapp_skipped_registration');
                } catch (error) {
                    console.error('Error removing skipped registration flag:', error);
                }
                router.replace('/(tabs)/index');
            } else {
                Alert.alert('Registration Failed', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const navigateBack = () => {
        router.back();
    };

    const skipRegistration = async () => {
        // Mark first load as complete
        await markFirstLoadComplete();
        // Mark that user has skipped registration
        try {
            await AsyncStorage.setItem('bookapp_skipped_registration', 'true');
        } catch (error) {
            console.error('Error marking skipped registration:', error);
        }
        router.replace('/(tabs)/index');
    };

    return (
        <KeyboardAvoidingView
            style={ styles.container }
            behavior={ Platform.OS === 'ios' ? 'padding' : 'height' }
        >
            <ScrollView contentContainerStyle={ styles.scrollContainer }>
                <View style={ styles.content }>
                    <Text style={ styles.title }>Create Account</Text>
                    <Text style={ styles.subtitle }>Sign up to get started</Text>
                    
                    {isFirstLoad && (
                        <View style={ styles.firstLoadMessage }>
                            <Text style={ styles.firstLoadText }>
                                Welcome to BookApp! You can skip registration for now and complete it anytime from the profile page.
                            </Text>
                        </View>
                    )}

                    <View style={ styles.form }>
                        <View style={ styles.inputContainer }>
                            <Text style={ styles.label }>Display Name</Text>
                            <TextInput
                                style={ styles.input }
                                value={ username }
                                onChangeText={ setUsername }
                                placeholder="Enter your display name"
                                autoCapitalize="words"
                                autoCorrect={ false }
                            />
                        </View>

                        <View style={ styles.inputContainer }>
                            <Text style={ styles.label }>Email</Text>
                            <TextInput
                                style={ styles.input }
                                value={ email }
                                onChangeText={ setEmail }
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={ false }
                            />
                        </View>

                        <View style={ styles.inputContainer }>
                            <Text style={ styles.label }>Password</Text>
                            <TextInput
                                style={ styles.input }
                                value={ password }
                                onChangeText={ setPassword }
                                placeholder="Enter your password"
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={ false }
                            />
                            <Text style={ styles.passwordRequirements }>
                                Password must be at least 8 characters with uppercase, lowercase, number, and special character
                            </Text>
                        </View>

                        <View style={ styles.inputContainer }>
                            <Text style={ styles.label }>Confirm Password</Text>
                            <TextInput
                                style={ styles.input }
                                value={ confirmPassword }
                                onChangeText={ setConfirmPassword }
                                placeholder="Confirm your password"
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={ false }
                            />
                        </View>

                        <TouchableOpacity
                            style={ [styles.button, loading && styles.buttonDisabled] }
                            onPress={ handleRegister }
                            disabled={ loading }
                        >
                            <Text style={ styles.buttonText }>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>

                        {isFirstLoad && (
                            <TouchableOpacity
                                style={ styles.skipButton }
                                onPress={ skipRegistration }
                                disabled={ loading }
                            >
                                <Text style={ styles.skipButtonText }>Skip for Now</Text>
                            </TouchableOpacity>
                        )}

                        <View style={ styles.footer }>
                            <Text style={ styles.footerText }>Already have an account? </Text>
                            <TouchableOpacity onPress={ () => router.push('/(tabs)/profile/login' as any) }>
                                <Text style={ styles.linkText }>Sign In</Text>
                            </TouchableOpacity>
                        </View>

                        {!isFirstLoad && (
                            <View style={ styles.backFooter }>
                                <TouchableOpacity onPress={ navigateBack }>
                                    <Text style={ styles.backLinkText }>Back to Profile</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex           : 1,
        backgroundColor: '#ffffff',
    },
    scrollContainer: {
        flexGrow      : 1,
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical  : 40,
    },
    title: {
        fontSize    : 32,
        fontWeight  : 'bold',
        color       : '#1f2937',
        textAlign   : 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize    : 16,
        color       : '#6b7280',
        textAlign   : 'center',
        marginBottom: 40,
    },
    form          : { gap: 20 },
    inputContainer: { gap: 8 },
    label         : {
        fontSize  : 14,
        fontWeight: '600',
        color     : '#374151',
    },
    input: {
        borderWidth      : 1,
        borderColor      : '#d1d5db',
        borderRadius     : 8,
        paddingHorizontal: 16,
        paddingVertical  : 12,
        fontSize         : 16,
        backgroundColor  : '#ffffff',
    },
    button: {
        backgroundColor: '#1e40af',
        borderRadius   : 8,
        paddingVertical: 16,
        alignItems     : 'center',
        marginTop      : 8,
    },
    buttonDisabled: { backgroundColor: '#9ca3af' },
    buttonText    : {
        color     : '#ffffff',
        fontSize  : 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection : 'row',
        justifyContent: 'center',
        marginTop     : 24,
    },
    footerText: {
        color   : '#6b7280',
        fontSize: 14,
    },
    linkText: {
        color     : '#1e40af',
        fontSize  : 14,
        fontWeight: '600',
    },
    firstLoadMessage: {
        backgroundColor: '#fef3c7',
        borderWidth    : 1,
        borderColor    : '#f59e0b',
        borderRadius   : 8,
        padding        : 16,
        marginBottom   : 24,
    },
    firstLoadText: {
        color     : '#92400e',
        fontSize  : 14,
        lineHeight: 20,
        textAlign : 'center',
    },
    skipButton: {
        backgroundColor: 'transparent',
        borderWidth    : 1,
        borderColor    : '#6b7280',
        borderRadius   : 8,
        paddingVertical: 16,
        alignItems     : 'center',
        marginTop      : 12,
    },
    skipButtonText: {
        color     : '#6b7280',
        fontSize  : 16,
        fontWeight: '600',
    },
    backFooter: {
        flexDirection : 'row',
        justifyContent: 'center',
        marginTop     : 16,
    },
    backLinkText: {
        color     : '#6b7280',
        fontSize  : 14,
        fontWeight: '500',
    },
    passwordRequirements: {
        fontSize    : 12,
        color       : '#6b7280',
        marginTop   : 4,
        fontStyle   : 'italic',
    },
});
