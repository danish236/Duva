import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker'; // The new library!

export default function ProfileScreen() {
  const router = useRouter();
  const { session, setSession } = useAuth();
  
  // State to hold the image we want to display
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    setSession(null); // Clear the brain
    router.replace('/(auth)/login');
  };

  // The function to open the gallery and upload
  const pickAndUploadImage = async () => {
    // 1. Ask for permission to access the camera roll
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("We need permission to access your photos!");
      return;
    }

    // 2. Open the gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Lets them crop it into a square!
      aspect: [1, 1],
      quality: 0.5, // Compress it slightly so it uploads fast
      base64: true, // We need this to send it over our JSON API
    });

    if (!result.canceled && result.assets[0].base64) {
      setUploading(true);
      
      try {
        // 3. Send the image to our new Hono backend
        const response = await fetch('http://localhost:8787/upload-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            base64Image: result.assets[0].base64,
            extension: 'jpg'
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          // Instantly update the UI with the live Supabase URL!
          setProfileImage(data.url);
        } else {
          alert('Upload failed: ' + data.error);
        }
      } catch (error) {
        alert('Network Error. Could not connect to backend.');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        
        {/* Interactive Avatar Photo */}
        <TouchableOpacity onPress={pickAndUploadImage} disabled={uploading}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              {uploading ? <ActivityIndicator color="#000" /> : <Text style={styles.avatarText}>+</Text>}
            </View>
          )}
        </TouchableOpacity>
        
        {/* Instructions */}
        <Text style={styles.uploadHint}>
          {uploading ? 'Uploading to Supabase...' : 'Tap to change photo'}
        </Text>

        <Text style={styles.name}>Your Profile</Text>
      </View>

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

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAFAFA', padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 30 },
  
  // New Image Styles
  avatarPlaceholder: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 2, borderColor: '#CCC', borderStyle: 'dashed' },
  avatarImage: { width: 140, height: 140, borderRadius: 70, marginBottom: 10, borderWidth: 2, borderColor: '#000' },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#757575' },
  uploadHint: { fontSize: 14, color: '#666', marginBottom: 20 },
  
  name: { fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 5 },
  section: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, marginBottom: 40, borderWidth: 1, borderColor: '#E0E0E0' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888', textTransform: 'uppercase', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rowText: { fontSize: 16, color: '#333' },
  subText: { fontSize: 16, color: '#666' },
  logoutButton: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FF4D4D' },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#FF4D4D' }
});