import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const { session } = useAuth();
  const router = useRouter();
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // State to hold the person we just matched with
  const [recentMatch, setRecentMatch] = useState<any>(null);
  
  // Lightweight animation controller
  const slideAnim = useRef(new Animated.Value(-150)).current; 

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch(`http://localhost:8787/pool?userId=${session.user.id}`);
      const data = await response.json();
      if (data.success) {
        setProfiles(data.profiles);
      }
    } catch (error) {
      console.error('Failed to fetch pool:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerMatchAnimation = (profile: any) => {
    setRecentMatch(profile);
    
    // Slide it down
    Animated.spring(slideAnim, {
      toValue: 20, // Drop down 20 pixels from the top
      useNativeDriver: true,
      speed: 12,
    }).start();

    // Auto-hide it after 3 seconds so they can keep swiping!
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -150, // Slide back up off-screen
        duration: 300,
        useNativeDriver: true,
      }).start(() => setRecentMatch(null));
    }, 3000);
  };

  const handleAction = async (action: 'like' | 'pass') => {
    const swipedProfile = profiles[currentIndex];
    setCurrentIndex((prevIndex) => prevIndex + 1);

    try {
      const response = await fetch('http://localhost:8787/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          swiperId: session.user.id,
          swipedId: swipedProfile.id,
          action: action
        })
      });
      
      const result = await response.json();
      
      // If the backend says it's a mutual match, trigger our unique UI!
      if (result.match) {
        triggerMatchAnimation(swipedProfile);
      }
    } catch (error) {
      console.error("Failed to save swipe:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (currentIndex >= profiles.length || profiles.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>You're all caught up.</Text>
      </View>
    );
  }

  const profile = profiles[currentIndex];
  const age = new Date().getFullYear() - new Date(profile.dob).getFullYear();

  return (
    <View style={styles.container}>
      
      {/* THE UNIQUE MATCH NOTIFICATION (Floats over everything) */}
      <Animated.View style={[styles.matchOverlay, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.matchTitle}>✨ Zenith Alignment ✨</Text>
        {recentMatch && <Text style={styles.matchSub}>You and {recentMatch.first_name} connected!</Text>}
      </Animated.View>

      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>[ Profile Image ]</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{profile.first_name}, {age}</Text>
          <Text style={styles.location}>📍 {profile.location}</Text>
          <Text style={styles.workEdu}>💼 {profile.work}  •  🎓 {profile.education}</Text>
          <View style={styles.bioBox}>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.passButton]} onPress={() => handleAction('pass')}>
          <Text style={styles.passText}>Pass</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.likeButton]} onPress={() => handleAction('like')}>
          <Text style={styles.likeText}>Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 20, justifyContent: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  
  // The sleek, lightweight notification style
  matchOverlay: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: '#1A1A1A', // Sleek dark mode styling
    padding: 20,
    borderRadius: 20,
    zIndex: 100, // Make sure it floats on top of the card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50', // A subtle glowing green border
  },
  matchTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  matchSub: { color: '#CCC', fontSize: 15 },

  card: { backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginBottom: 30 },
  imagePlaceholder: { height: 300, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#757575', fontSize: 18, fontWeight: 'bold' },
  infoContainer: { padding: 20 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 5 },
  location: { fontSize: 16, color: '#666', marginBottom: 10 },
  workEdu: { fontSize: 14, color: '#444', fontWeight: '600', marginBottom: 15 },
  bioBox: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 12 },
  bioText: { fontSize: 15, color: '#333', lineHeight: 22 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-evenly' },
  button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, width: 140, alignItems: 'center', elevation: 3 },
  passButton: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FF4D4D' },
  likeButton: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#4CAF50' },
  passText: { color: '#FF4D4D', fontSize: 18, fontWeight: 'bold' },
  likeText: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold' },
  emptyText: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
});