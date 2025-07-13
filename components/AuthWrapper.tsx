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
        // User is not authenticated and is first load
        if (!loading && !user && isFirstLoad) {
            // First app load, redirect to register screen
            router.replace('/(tabs)/profile/register' as any);
        }
    }, [user, loading, isFirstLoad]);

    if (loading) {
        return (
            <View style={ styles.loadingContainer }>
                <ActivityIndicator size="large" color="#1e40af" />
            </View>
        );
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
