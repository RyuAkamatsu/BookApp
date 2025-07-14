import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { checkFirstLoad } from '@/utils/firstLoad';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from '@/components/LoadingScreen';

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

    if (loading || isFirstLoad === null) {
        return <LoadingScreen visible={true} message="Setting up your library..." />;
    }

    return <>{children}</>;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F7F4',
    },
});