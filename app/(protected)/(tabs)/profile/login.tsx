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
import { loginUser } from '@/utils/firebase/firebase';
import { useAuth } from '@/hooks/useAuth';
import { syncDatabaseWithFirebase } from '@/utils/firebase/syncDatabase';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuth();

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
        
                router.replace('/(tabs)/index');
            } else {
                Alert.alert('Login Failed', result.error);
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

    return (
        <KeyboardAvoidingView
            style={ styles.container }
            behavior={ Platform.OS === 'ios' ? 'padding' : 'height' }
        >
            <ScrollView contentContainerStyle={ styles.scrollContainer }>
                <View style={ styles.content }>
                    <Text style={ styles.title }>Welcome Back</Text>
                    <Text style={ styles.subtitle }>Sign in to your account</Text>

                    <View style={ styles.form }>
                        <View style={ styles.inputContainer }>
                            <Text style={ styles.label }>Username</Text>
                            <TextInput
                                style={ styles.input }
                                value={ username }
                                onChangeText={ setUsername }
                                placeholder="Enter your username"
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
                        </View>

                        <TouchableOpacity
                            style={ [styles.button, loading && styles.buttonDisabled] }
                            onPress={ handleLogin }
                            disabled={ loading }
                        >
                            <Text style={ styles.buttonText }>
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>

                        <View style={ styles.footer }>
                            <TouchableOpacity onPress={ navigateBack }>
                                <Text style={ styles.linkText }>Back to Profile</Text>
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
});
