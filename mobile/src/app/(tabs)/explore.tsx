import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function ExploreScreen() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch the profiles as soon as the screen loads
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('http://localhost:8787/pool');
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

  // Move to the next profile when a button is clicked
  const handleAction = (action: 'like' | 'pass') => {
    console.log(`You chose to ${action} profile: ${profiles[currentIndex].first_name}`);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Finding your matches...</Text>
      </View>
    );
  }

  if (currentIndex >= profiles.length || profiles.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>You've seen everyone!</Text>
        <Text style={styles.subText}>Check back later for more Zenith Matches.</Text>
      </View>
    );
  }

  // Grab the current profile to display
  const profile = profiles[currentIndex];
  
  // Quick age calculation from DOB
  const birthYear = new Date(profile.dob).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  return (
    <View style={styles.container}>
      {/* The Profile Card */}
      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>[ Profile Image ]</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{profile.first_name}, {age}</Text>
          <Text style={styles.location}>📍 {profile.location}</Text>
          <Text style={styles.workEdu}>💼 {profile.work}  •  🎓 {profile.education}</Text>
          
          <View style={styles.bioBox}>
            <Text style={styles.bioLabel}>About</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        </View>
      </View>

      {/* The Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.passButton]} onPress={() => handleAction('pass')}>
          <Text style={styles.passText}>❌ Pass</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.likeButton]} onPress={() => handleAction('like')}>
          <Text style={styles.likeText}>❤️ Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 20,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 30,
  },
  imagePlaceholder: {
    height: 300,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#757575',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  workEdu: {
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
    marginBottom: 15,
  },
  bioBox: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
  },
  bioLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  bioText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  passButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF4D4D',
  },
  likeButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  passText: {
    color: '#FF4D4D',
    fontSize: 18,
    fontWeight: 'bold',
  },
  likeText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#666',
  }
});