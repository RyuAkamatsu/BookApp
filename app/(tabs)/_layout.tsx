import { Tabs } from 'expo-router';
import { Camera, BookOpen, User, BookmarkPlus, Search } from 'lucide-react-native';
import AuthWrapper from '@/components/AuthWrapper';
import { useTheme } from '@/utils/theme';

export default function TabLayout() {
    const { theme } = useTheme();

    return (
        <AuthWrapper>
            <Tabs
                screenOptions={{
                    headerShown            : false,
                    tabBarActiveTintColor  : theme.colors.primary,
                    tabBarInactiveTintColor: theme.colors.textTertiary,
                    tabBarStyle: {
                        backgroundColor: theme.colors.surface,
                        borderTopWidth : 2,
                        borderTopColor : theme.colors.border,
                        paddingBottom  : 30, // Increased for Android navigation buttons
                        paddingTop     : 8,
                        height         : 110, // Increased height to accommodate padding
                        shadowColor    : theme.colors.textPrimary,
                        shadowOffset   : { width: 0, height: -2 },
                        shadowOpacity  : 0.1,
                        shadowRadius   : 4,
                        elevation      : 8,
                    },
                    tabBarLabelStyle: {
                        fontSize  : 12,
                        fontWeight: '600',
                        marginTop : 4,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Camera',
                        tabBarIcon: ({ size, color }) => (
                            <Camera size={ size } color={ color } />
                        )
                    }}
                />
                <Tabs.Screen
                    name="library"
                    options={{
                        title: 'Library',
                        tabBarIcon: ({ size, color }) => (
                            <BookOpen size={ size } color={ color } />
                        )
                    }}
                />
                <Tabs.Screen
                    name="to-read"
                    options={{
                        title: 'To Read',
                        tabBarIcon: ({ size, color }) => (
                            <BookmarkPlus size={ size } color={ color } />
                        )
                    }}
                />
                <Tabs.Screen
                    name="manual-book-lookup"
                    options={{
                    title: 'Manual Lookup',
                        tabBarIcon: ({ size, color }) => (
                            <Search size={ size } color={ color } />
                        )
                    }}
                />
                {/* <Tabs.Screen
                    name="profile"
                    options={{
                    title: 'Profile',
                        tabBarIcon: ({ size, color }) => (
                            <User size={ size } color={ color } />
                        )
                    }}
                /> */}
            </Tabs>
        </AuthWrapper>
    );
}