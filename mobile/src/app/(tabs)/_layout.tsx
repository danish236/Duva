// mobile/src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#000', headerShown: false }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Pool',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🧭</Text>,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>💬</Text>,
        }}
      />
      {/* 1. Added the Profile Tab Here */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}