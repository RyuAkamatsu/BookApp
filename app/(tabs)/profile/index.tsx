import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { User, Settings, CircleHelp as HelpCircle, Star, Share, BookOpen, Camera, Smartphone, LogOut, UserPlus, LogIn, Sun, Moon, Monitor } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/utils/firebase';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/utils/theme';

export default function ProfileTab() {
    const { user, setUser } = useAuth();
    const { theme, themeMode, updateThemeMode, isDark } = useTheme();
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

    const getThemeIcon = () => {
        switch (themeMode) {
            case 'light':
                return Sun;
            case 'dark':
                return Moon;
            case 'system':
                return Monitor;
            default:
                return Monitor;
        }
    };

    const getThemeTitle = () => {
        switch (themeMode) {
            case 'light':
                return 'Light Theme';
            case 'dark':
                return 'Dark Theme';
            case 'system':
                return 'System Default';
            default:
                return 'System Default';
        }
    };

    const handleThemeChange = () => {
        const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(themeMode);
        const nextIndex = (currentIndex + 1) % themes.length;
        updateThemeMode(themes[nextIndex]);
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
                    router.push('/(tabs)/profile/register' as any);
                }
            }
        ] : []),
        ...(showCompleteRegistration ? [
            { 
                title: 'Login', 
                icon: LogIn, 
                onPress: () => {
                    router.push('/(tabs)/profile/login' as any);
                }
            }
        ] : []),
        { title: 'Account Settings', icon: Settings, onPress: () => {} },
        { 
            title: getThemeTitle(), 
            icon: getThemeIcon(), 
            onPress: handleThemeChange 
        },
        { title: 'Rate App', icon: Star, onPress: () => {} },
        { title: 'Share App', icon: Share, onPress: () => {} },
        { title: 'Help & Support', icon: HelpCircle, onPress: () => {} },
        ...(user ? [{ title: 'Logout', icon: LogOut, onPress: handleLogout }] : []),
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={ false }>
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Profile</Text>
            </View>

            <View style={[styles.profileSection, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
                    <User size={ 40 } color="#ffffff" />
                </View>
                <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{user?.email?.split('@')[0] || 'Guest User'}</Text>
                <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{user?.email || 'Not signed in'}</Text>
                {showCompleteRegistration && (
                    <Text style={[styles.guestMessage, { color: theme.colors.textSecondary }]}>
                        Sign in to sync your data across devices
                    </Text>
                )}
            </View>

            <View style={[styles.statsSection, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Your Stats</Text>
                <View style={ styles.statsGrid }>
                    {stats.map((stat, index) => (
                        <View key={ index } style={[styles.statCard, { backgroundColor: theme.colors.backgroundSecondary }]}>
                            <stat.icon size={ 24 } color={theme.colors.primary} />
                            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{stat.value}</Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Settings</Text>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={ index }
                        style={[styles.menuItem, { borderBottomColor: theme.colors.borderLight }]}
                        onPress={ item.onPress }
                        activeOpacity={ 0.7 }
                    >
                        <View style={ styles.menuItemLeft }>
                            <View style={[styles.menuIcon, { backgroundColor: theme.colors.backgroundSecondary }]}>
                                <item.icon size={ 20 } color={theme.colors.textSecondary} />
                            </View>
                            <Text style={[styles.menuItemText, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                        </View>
                        <Text style={[styles.menuItemArrow, { color: theme.colors.textTertiary }]}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={ styles.footer }>
                <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>Bookshelf Scanner v1.0.0</Text>
                <Text style={[styles.footerSubtext, { color: theme.colors.textTertiary }]}>
                    Made with ❤️ for book enthusiasts
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop       : 60,
        paddingHorizontal: 24,
        paddingBottom    : 24,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize  : 28,
        fontWeight: '700',
    },
    profileSection: {
        alignItems     : 'center',
        paddingVertical: 32,
        marginBottom   : 24,
    },
    avatarContainer: {
        width          : 80,
        height         : 80,
        borderRadius   : 40,
        alignItems     : 'center',
        justifyContent : 'center',
        marginBottom   : 16,
    },
    userName: {
        fontSize    : 24,
        fontWeight  : '700',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
    },
    guestMessage: {
        fontSize    : 14,
        textAlign   : 'center',
        marginTop   : 8,
        fontStyle   : 'italic',
    },
    statsSection: {
        padding        : 24,
        marginBottom   : 24,
    },
    sectionTitle: {
        fontSize    : 20,
        fontWeight  : '700',
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
        borderRadius    : 12,
        marginHorizontal: 4,
    },
    statValue: {
        fontSize    : 24,
        fontWeight  : '700',
        marginTop   : 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize  : 12,
        textAlign : 'center',
        fontWeight: '600',
    },
    menuSection: {
        padding        : 24,
        marginBottom   : 24,
    },
    menuItem: {
        flexDirection    : 'row',
        alignItems       : 'center',
        justifyContent   : 'space-between',
        paddingVertical  : 16,
        borderBottomWidth: 1,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems   : 'center',
    },
    menuIcon: {
        width          : 40,
        height         : 40,
        borderRadius   : 20,
        alignItems     : 'center',
        justifyContent : 'center',
        marginRight    : 16,
    },
    menuItemText: {
        fontSize  : 16,
        fontWeight: '600',
    },
    menuItemArrow: {
        fontSize  : 20,
        fontWeight: '300',
    },
    footer: {
        alignItems       : 'center',
        paddingVertical  : 32,
        paddingHorizontal: 24,
    },
    footerText: {
        fontSize    : 14,
        fontWeight  : '600',
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
    },
});
