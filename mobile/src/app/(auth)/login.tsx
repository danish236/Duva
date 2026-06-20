import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:8787/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        // We successfully verified the user! Move to the feed.
        router.replace('/(tabs)/explore');
      } else {
        setErrorMsg(result.error);
      }
    } catch (error) {
      setErrorMsg('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <Text style={styles.logo}>Duva</Text>
        <Text style={styles.subtitle}>Find your Zenith Match.</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <Link href="/(auth)/register" style={styles.linkText}>
          Don't have an account? Create Profile
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 24, justifyContent: 'center' },
  brandContainer: { alignItems: 'center', marginBottom: 60 },
  logo: { fontSize: 48, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#666' },
  formContainer: { width: '100%' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 15, height: 60, fontSize: 18, marginBottom: 16 },
  button: { backgroundColor: '#000', height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  linkText: { textAlign: 'center', color: '#666', fontSize: 16, marginTop: 10, textDecorationLine: 'underline' },
  errorText: { color: '#FF4D4D', marginBottom: 16, textAlign: 'center', fontWeight: 'bold' }
});