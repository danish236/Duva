// mobile/src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Text } from 'react-native'; // <-- This was missing!

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#000', headerShown: false }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Pool',
          tabBarIcon: () => <Text>🧭</Text>,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: () => <Text>💬</Text>,
        }}
      />
    </Tabs>
  );
}