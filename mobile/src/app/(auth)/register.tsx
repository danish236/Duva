// mobile/src/app/(auth)/register.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, Button, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', location: '', bio: '',
    dob: '2000-01-01', work: '', education: '', genderId: 1
  });

  const handleRegister = async () => {
    try {
      setStatusMessage('Saving to database...');
      const API_URL = 'http://localhost:8787/register';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatusMessage('✅ Success! Taking you to the pool...');
        // Wait 1.5 seconds so they can see the success message, then navigate to the tabs
        setTimeout(() => {
          router.replace('/(tabs)/explore');
        }, 1500);
      } else {
        setStatusMessage('❌ Error: ' + result.error);
      }
    } catch (error) {
      setStatusMessage('❌ Network Error: Could not connect to server.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Join Duva</Text>

      <TextInput style={styles.input} placeholder="First Name" onChangeText={(text) => setFormData({ ...formData, firstName: text })} />
      <TextInput style={styles.input} placeholder="Last Name" onChangeText={(text) => setFormData({ ...formData, lastName: text })} />
      <TextInput style={styles.input} placeholder="Location (e.g. Mumbai)" onChangeText={(text) => setFormData({ ...formData, location: text })} />
      <TextInput style={[styles.input, styles.textArea]} placeholder="Write a short bio..." multiline onChangeText={(text) => setFormData({ ...formData, bio: text })} />
      <TextInput style={styles.input} placeholder="Work / Job Title" onChangeText={(text) => setFormData({ ...formData, work: text })} />
      <TextInput style={styles.input} placeholder="Education" onChangeText={(text) => setFormData({ ...formData, education: text })} />

      <Button title="Create Profile" onPress={handleRegister} color="#000" />

      {statusMessage ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#FAFAFA' },
  header: { fontSize: 32, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FFF', padding: 16, marginBottom: 16, borderRadius: 12, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  statusBox: { marginTop: 20, padding: 16, borderRadius: 8, backgroundColor: '#E8F5E9', alignItems: 'center' },
  statusText: { fontSize: 16, color: '#2E7D32', fontWeight: 'bold' }
});