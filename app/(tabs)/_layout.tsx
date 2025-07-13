import { Tabs } from 'expo-router';
import { Camera, BookOpen, User, BookmarkPlus } from 'lucide-react-native';
import AuthWrapper from '@/components/AuthWrapper';

export default function TabLayout() {
  return (
    <AuthWrapper>
      <Tabs
      screenOptions={{
        headerShown            : false,
        tabBarActiveTintColor  : '#8B4513',
        tabBarInactiveTintColor: '#8D6E63',
        tabBarStyle: {
          backgroundColor: '#FDF8F3',
          borderTopWidth : 2,
          borderTopColor : '#D7CCC8',
          paddingBottom  : 8,
          paddingTop     : 8,
          height         : 80,
          shadowColor    : '#2D1810',
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
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Camera',
          tabBarIcon: ({ size, color }) => (
            <Camera size={ size } color={ color } />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={ size } color={ color } />
          ),
        }}
      />
      <Tabs.Screen
        name="to-read"
        options={{
          title: 'To Read',
          tabBarIcon: ({ size, color }) => (
            <BookmarkPlus size={ size } color={ color } />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={ size } color={ color } />
          ),
        }}
      />
      </Tabs>
    </AuthWrapper>
  );
}