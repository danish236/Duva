// mobile/src/app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext'; // Import the provider

export default function RootLayout() {
  return (
    // Wrap the entire routing stack in the AuthProvider
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}