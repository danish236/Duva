// mobile/src/app/(tabs)/profile.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // We will clear the Supabase token here later. For now, route to Login.
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Header Section */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>D</Text>
        </View>
        <Text style={styles.name}>Danish, 26</Text>
        <Text style={styles.job}>Developer • Mumbai</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>✏️ Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Account Settings List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Verify Profile</Text>
          <Text>✅</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Subscription</Text>
          <Text style={styles.subText}>Free Tier</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAFAFA', padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 30 },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#757575' },
  name: { fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 5 },
  job: { fontSize: 16, color: '#666' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  actionButton: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: '#E0E0E0' },
  actionText: { fontSize: 16, fontWeight: '600', color: '#333' },
  section: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, marginBottom: 40, borderWidth: 1, borderColor: '#E0E0E0' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888', textTransform: 'uppercase', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rowText: { fontSize: 16, color: '#333' },
  subText: { fontSize: 16, color: '#666' },
  logoutButton: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FF4D4D' },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#FF4D4D' }
});