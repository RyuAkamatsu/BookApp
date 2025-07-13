import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { checkFirstLoad } from '@/utils/firstLoad';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const [isFirstLoad, setIsFirstLoad] = useState<boolean | null>(null);
    const [hasSkippedRegistration, setHasSkippedRegistration] = useState<boolean>(false);

    useEffect(() => {
        const checkFirstLoadStatus = async () => {
            const firstLoad = await checkFirstLoad();
            setIsFirstLoad(firstLoad);
            
            // Check if user has skipped registration
            try {
                const skippedValue = await AsyncStorage.getItem('bookapp_skipped_registration');
                setHasSkippedRegistration(skippedValue === 'true');
            } catch (error) {
                console.error('Error checking skipped registration:', error);
            }
        };
        checkFirstLoadStatus();
    }, []);

    useEffect(() => {
        if (!loading && isFirstLoad !== null) {
            if (!user) {
                // User is not authenticated
                if (isFirstLoad) {
                    // First app load, redirect to registration
                    if (pathname !== '/register') {
                        router.replace('/register' as any);
                    }
                } else if (hasSkippedRegistration) {
                    // User skipped registration, allow access to main app
                    if (pathname === '/login' || pathname === '/register') {
                        router.replace('/(tabs)');
                    }
                } else {
                    // Not first load and hasn't skipped, redirect to login
                    if (pathname !== '/login' && pathname !== '/register') {
                        router.replace('/login' as any);
                    }
                }
            } else {
                // User is authenticated, ensure they're on the main app
                if (pathname === '/login' || pathname === '/register') {
                    router.replace('/(tabs)');
                }
            }
        }
    }, [user, loading, pathname, isFirstLoad, hasSkippedRegistration]);

    if (loading) {
        return (
            <View style={ styles.loadingContainer }>
                <ActivityIndicator size="large" color="#1e40af" />
            </View>
        );
    }

    if (!user && pathname !== '/login' && pathname !== '/register' && !hasSkippedRegistration) {
        return null; // Will redirect to login
    }

    return <>{children}</>;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex           : 1,
        justifyContent : 'center',
        alignItems     : 'center',
        backgroundColor: '#ffffff',
    },
});
