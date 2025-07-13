import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { User, Settings, CircleHelp as HelpCircle, Star, Share, BookOpen, Camera, Smartphone, LogOut, UserPlus } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/utils/firebase';
import { checkFirstLoad } from '@/utils/firstLoad';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileTab() {
    const { user, setUser } = useAuth();
    const [showCompleteRegistration, setShowCompleteRegistration] = useState(false);

    useEffect(() => {
        const checkRegistrationStatus = async () => {
            try {
                const skippedValue = await AsyncStorage.getItem('bookapp_skipped_registration');
                // Show complete registration option if user has skipped registration
                setShowCompleteRegistration(skippedValue === 'true');
            } catch (error) {
                console.error('Error checking registration status:', error);
            }
        };
        checkRegistrationStatus();
    }, []);
  
    const stats = [
        { label: 'Books Scanned', value: '127', icon: BookOpen },
        { label: 'Photos Taken', value: '43', icon: Camera },
        { label: 'Collections', value: '8', icon: Smartphone },
    ];

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text   : 'Logout',
                    style  : 'destructive',
                    onPress: async () => {
                        const result = await logoutUser();
                        if (result.success) {
                            setUser(null);
                        } else {
                            Alert.alert('Error', 'Failed to logout');
                        }
                    },
                },
            ]
        );
    };

    const menuItems = [
        ...(showCompleteRegistration ? [
            { 
                title: 'Complete Registration', 
                icon: UserPlus, 
                onPress: async () => {
                    // Remove the skipped registration flag when they choose to complete registration
                    try {
                        await AsyncStorage.removeItem('bookapp_skipped_registration');
                        setShowCompleteRegistration(false);
                    } catch (error) {
                        console.error('Error removing skipped registration flag:', error);
                    }
                    router.push('/register' as any);
                }
            }
        ] : []),
        { title: 'Account Settings', icon: Settings, onPress: () => {} },
        { title: 'Rate App', icon: Star, onPress: () => {} },
        { title: 'Share App', icon: Share, onPress: () => {} },
        { title: 'Help & Support', icon: HelpCircle, onPress: () => {} },
        { title: 'Logout', icon: LogOut, onPress: handleLogout },
    ];

    return (
        <ScrollView style={ styles.container } showsVerticalScrollIndicator={ false }>
            <View style={ styles.header }>
                <Text style={ styles.headerTitle }>Profile</Text>
            </View>

            <View style={ styles.profileSection }>
                <View style={ styles.avatarContainer }>
                    <User size={ 40 } color="#ffffff" />
                </View>
                <Text style={ styles.userName }>{user?.email?.split('@')[0] || 'User'}</Text>
                <Text style={ styles.userEmail }>{user?.email || 'user@example.com'}</Text>
            </View>

            <View style={ styles.statsSection }>
                <Text style={ styles.sectionTitle }>Your Stats</Text>
                <View style={ styles.statsGrid }>
                    {stats.map((stat, index) => (
                        <View key={ index } style={ styles.statCard }>
                            <stat.icon size={ 24 } color="#1e40af" />
                            <Text style={ styles.statValue }>{stat.value}</Text>
                            <Text style={ styles.statLabel }>{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={ styles.menuSection }>
                <Text style={ styles.sectionTitle }>Settings</Text>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={ index }
                        style={ styles.menuItem }
                        onPress={ item.onPress }
                        activeOpacity={ 0.7 }
                    >
                        <View style={ styles.menuItemLeft }>
                            <View style={ styles.menuIcon }>
                                <item.icon size={ 20 } color="#6b7280" />
                            </View>
                            <Text style={ styles.menuItemText }>{item.title}</Text>
                        </View>
                        <Text style={ styles.menuItemArrow }>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={ styles.footer }>
                <Text style={ styles.footerText }>Bookshelf Scanner v1.0.0</Text>
                <Text style={ styles.footerSubtext }>
                    Made with ❤️ for book enthusiasts
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex           : 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop       : 60,
        paddingHorizontal: 24,
        paddingBottom    : 24,
        backgroundColor  : '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize  : 28,
        fontWeight: '700',
        color     : '#1f2937',
    },
    profileSection: {
        backgroundColor: '#ffffff',
        alignItems     : 'center',
        paddingVertical: 32,
        marginBottom   : 24,
    },
    avatarContainer: {
        width          : 80,
        height         : 80,
        borderRadius   : 40,
        backgroundColor: '#1e40af',
        alignItems     : 'center',
        justifyContent : 'center',
        marginBottom   : 16,
    },
    userName: {
        fontSize    : 24,
        fontWeight  : '700',
        color       : '#1f2937',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color   : '#6b7280',
    },
    statsSection: {
        backgroundColor: '#ffffff',
        padding        : 24,
        marginBottom   : 24,
    },
    sectionTitle: {
        fontSize    : 20,
        fontWeight  : '700',
        color       : '#1f2937',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection : 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        alignItems      : 'center',
        flex            : 1,
        paddingVertical : 16,
        backgroundColor : '#f8fafc',
        borderRadius    : 12,
        marginHorizontal: 4,
    },
    statValue: {
        fontSize    : 24,
        fontWeight  : '700',
        color       : '#1f2937',
        marginTop   : 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize  : 12,
        color     : '#6b7280',
        textAlign : 'center',
        fontWeight: '600',
    },
    menuSection: {
        backgroundColor: '#ffffff',
        padding        : 24,
        marginBottom   : 24,
    },
    menuItem: {
        flexDirection    : 'row',
        alignItems       : 'center',
        justifyContent   : 'space-between',
        paddingVertical  : 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems   : 'center',
    },
    menuIcon: {
        width          : 40,
        height         : 40,
        borderRadius   : 20,
        backgroundColor: '#f3f4f6',
        alignItems     : 'center',
        justifyContent : 'center',
        marginRight    : 16,
    },
    menuItemText: {
        fontSize  : 16,
        fontWeight: '600',
        color     : '#1f2937',
    },
    menuItemArrow: {
        fontSize  : 20,
        color     : '#d1d5db',
        fontWeight: '300',
    },
    footer: {
        alignItems       : 'center',
        paddingVertical  : 32,
        paddingHorizontal: 24,
    },
    footerText: {
        fontSize    : 14,
        color       : '#9ca3af',
        fontWeight  : '600',
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
        color   : '#d1d5db',
    },
});
