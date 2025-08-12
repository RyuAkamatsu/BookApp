import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/utils/firebase/firebase';
import { useTheme, getCommonStyles } from '@/styling/theme';

interface Dashboard {
  currentBook: any;
}

export default function DashboardTab() {
    const { theme } = useTheme();
    const commonStyles = getCommonStyles(theme);
    
    const [dashboard, setDashboard] = useState<Dashboard>({
        currentBook: null,
    });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        if (!user) return;
        
        setLoading(true);

        try {
            const result = await getUserProfile(user.uid);
            if (result.success && result.data) {
                setDashboard(result.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[commonStyles.container, { paddingBottom: insets.bottom }]}>
            
        </View>
    );
}
