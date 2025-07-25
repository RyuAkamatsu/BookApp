import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Settings, CircleHelp as HelpCircle, Star, Share, BookOpen, LogOut, Sun, Moon, Monitor } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser, getUserProfile } from '@/utils/firebase/firebase';
import { router } from 'expo-router';
import { useTheme, getCommonStyles } from '@/styling/theme';

export default function ProfileTab() {
    const { user, setUser } = useAuth();
    const { theme, themeMode, updateThemeMode, isDark } = useTheme();
    const commonStyles = getCommonStyles(theme);
    const [userProfile, setUserProfile] = useState<any>(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadUserProfile();
    }, [user]);

    const loadUserProfile = async () => {
        if (!user) return;
        
        try {
            const result = await getUserProfile(user.uid);
            if (result.success) {
                setUserProfile(result.data);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };
  
    const stats = [
        { label: 'Books Read', value: userProfile?.stats?.totalBooks || '0', icon: BookOpen },
        { label: 'Book Clubs', value: userProfile?.bookClubs?.length || '0', icon: User },
        { label: 'Reading Goal', value: userProfile?.stats?.readingGoal || '12', icon: Star },
    ];

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await logoutUser();
                        if (result.success) {
                            setUser(null);
                            router.replace('/login');
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
            case 'light': return Sun;
            case 'dark': return Moon;
            case 'system': return Monitor;
            default: return Monitor;
        }
    };

    const getThemeTitle = () => {
        switch (themeMode) {
            case 'light': return 'Light Theme';
            case 'dark': return 'Dark Theme';
            case 'system': return 'System Default';
            default: return 'System Default';
        }
    };

    const handleThemeChange = () => {
        const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(themeMode);
        const nextIndex = (currentIndex + 1) % themes.length;
        updateThemeMode(themes[nextIndex]);
    };

    const menuItems = [
        { title: 'Account Settings', icon: Settings, onPress: () => {} },
        { 
            title: getThemeTitle(), 
            icon: getThemeIcon(), 
            onPress: handleThemeChange 
        },
        { title: 'Rate App', icon: Star, onPress: () => {} },
        { title: 'Share App', icon: Share, onPress: () => {} },
        { title: 'Help & Support', icon: HelpCircle, onPress: () => {} },
        { title: 'Logout', icon: LogOut, onPress: handleLogout },
    ];

    return (
        <ScrollView 
            style={[commonStyles.container, { paddingBottom: insets.bottom + theme.spacing.xl }]} 
            showsVerticalScrollIndicator={false}
        >
            <View style={[commonStyles.header, { paddingTop: insets.top + theme.spacing.xl }]}>
                <Text style={commonStyles.headerTitle}>Profile</Text>
                <Text style={commonStyles.headerSubtitle}>
                    Manage your account and preferences
                </Text>
            </View>

            <View style={[commonStyles.card, styles.profileSection]}>
                <View style={styles.avatarContainer}>
                    <User size={40} color={theme.colors.surface} />
                </View>
                <Text style={[commonStyles.title, styles.userName]}>
                    {userProfile?.username || user?.displayName || user?.email?.split('@')[0] || 'User'}
                </Text>
                <Text style={[commonStyles.caption, styles.userEmail]}>
                    {user?.email}
                </Text>
            </View>

            <View style={[commonStyles.card, styles.statsSection]}>
                <Text style={[commonStyles.subtitle, styles.sectionTitle]}>Your Stats</Text>
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <stat.icon size={24} color={theme.colors.primary} />
                            <Text style={[commonStyles.title, styles.statValue]}>{stat.value}</Text>
                            <Text style={[commonStyles.caption, styles.statLabel]}>{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={[commonStyles.card, styles.menuSection]}>
                <Text style={[commonStyles.subtitle, styles.sectionTitle]}>Settings</Text>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={item.onPress}
                        activeOpacity={0.7}
                    >
                        <View style={commonStyles.row}>
                            <View style={styles.menuIcon}>
                                <item.icon size={20} color={theme.colors.textSecondary} />
                            </View>
                            <Text style={[commonStyles.body, styles.menuItemText]}>{item.title}</Text>
                        </View>
                        <Text style={styles.menuItemArrow}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.footer}>
                <Text style={[commonStyles.caption, styles.footerText]}>BookShelf v1.0.0</Text>
                <Text style={[commonStyles.caption, styles.footerSubtext]}>
                    Made with ❤️ for book enthusiasts
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = (theme => StyleSheet.create({
    profileSection: {
        alignItems: 'center',
        paddingVertical: theme.spacing['4xl'],
        marginHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
    },
    userName: {
        marginBottom: theme.spacing.xs,
        textAlign: 'center',
    },
    userEmail: {
        textAlign: 'center',
    },
    statsSection: {
        marginHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        marginBottom: theme.spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        marginHorizontal: theme.spacing.xs,
        backgroundColor: theme.colors.surfaceSecondary,
    },
    statValue: {
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    statLabel: {
        textAlign: 'center',
        fontWeight: theme.typography.fontWeight.semibold,
    },
    menuSection: {
        marginHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.lg,
    },
    menuItemText: {
        fontWeight: theme.typography.fontWeight.semibold,
    },
    menuItemArrow: {
        fontSize: 20,
        fontWeight: '300',
        color: theme.colors.textTertiary,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: theme.spacing['4xl'],
        paddingHorizontal: theme.spacing['2xl'],
    },
    footerText: {
        fontWeight: theme.typography.fontWeight.semibold,
        marginBottom: theme.spacing.xs,
    },
    footerSubtext: {
        // Uses default caption styles
    },
}))(theme);