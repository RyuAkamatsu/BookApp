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
                    headerShown: false,
                    tabBarActiveTintColor: '#00635D',
                    tabBarInactiveTintColor: '#8B7355',
                    tabBarStyle: {
                        backgroundColor: '#FFFFFF',
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
                    name="index"
                    options={{
                        title: 'Scan',
                        tabBarIcon: ({ size, color }) => (
                            <Camera size={size} color={color} />
                        )
                    }}
                />
                <Tabs.Screen
                    name="library"
                    options={{
                        title: 'My Books',
                        tabBarIcon: ({ size, color }) => (
                            <BookOpen size={size} color={color} />
                        )
                    }}
                />
                <Tabs.Screen
                    name="to-read"
                    options={{
                        title: 'Want to Read',
                        tabBarIcon: ({ size, color }) => (
                            <BookmarkPlus size={size} color={color} />
                        )
                    }}
                />
                <Tabs.Screen
                    name="manual-book-lookup"
                    options={{
                        title: 'Search',
                        tabBarIcon: ({ size, color }) => (
                            <Search size={size} color={color} />
                        )
                    }}
                />
            </Tabs>
        </AuthWrapper>
    );
}