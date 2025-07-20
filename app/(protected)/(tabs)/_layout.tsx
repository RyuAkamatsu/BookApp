import { Tabs } from 'expo-router';
import { BookOpen, Users, User, ChartLine, ChartPie } from 'lucide-react-native';
import AuthWrapper from '@/components/AuthWrapper';
import { useTheme } from '@/styling/theme';

export default function TabLayout() {
    const { theme, isLoading } = useTheme();
    
    // Don't render tabs until theme is loaded
    if (isLoading) {
        return null;
    }
    
    return (
        <AuthWrapper>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: theme.colors.primary,
                    tabBarInactiveTintColor: theme.colors.textSecondary,
                    tabBarStyle: {
                        backgroundColor: theme.colors.surface,
                        borderTopWidth: 0,
                        paddingBottom: 30,
                        paddingTop: 8,
                        height: 110,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 8,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                        marginTop: 4,
                    },
                    tabBarItemStyle: {
                        paddingVertical: 8,
                    },
                }}
            >
                <Tabs.Screen
                    name="dashboard"
                    options={{
                        title: 'Dashboard',
                        tabBarIcon: ({ size, color }) => (
                            <ChartLine size={size} color={color} />
                        )
                    }}
                />
                <Tabs.Screen
                    name="library"
                    options={{
                        title: 'My Library',
                        tabBarIcon: ({ size, color }) => (
                            <BookOpen size={size} color={color} />
                        )
                    }}
                />
                <Tabs.Screen
                    name="book-club"
                    options={{
                        title: 'My Book Club',
                        tabBarIcon: ({ size, color }) => (
                            <Users size={size} color={color} />
                        )
                    }}
                />
                <Tabs.Screen
                    name="stats"
                    options={{
                        title: 'Stats',
                        tabBarIcon: ({ size, color }) => (
                            <ChartPie size={size} color={color} />
                        )
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ size, color }) => (
                            <User size={size} color={color} />
                        )
                    }}
                />
            </Tabs>
        </AuthWrapper>
    );
}