// mobile/src/app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Right now, we automatically send everyone to the registration screen.
  // Later, we will check Supabase Auth here to see if they are already logged in.
  return <Redirect href="/(auth)/register" />;
}