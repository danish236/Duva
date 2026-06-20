// mobile/src/app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Direct users to the Login screen first
  return <Redirect href="/(auth)/login" />;
}