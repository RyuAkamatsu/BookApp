import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
    const { user, loading } = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            // User is not authenticated, redirect to login
            if (pathname !== '/login' && pathname !== '/register') {
                router.replace('/login');
            }
        }
    }, [user, loading, pathname]);

    if (loading) {
        return <LoadingScreen visible={true} message="Setting up your library..." />;
    }

    // If user is not authenticated and not on auth screens, show loading
    if (!user && pathname !== '/login' && pathname !== '/register') {
        return <LoadingScreen visible={true} message="Redirecting to login..." />;
    }

    return <>{children}</>;
}