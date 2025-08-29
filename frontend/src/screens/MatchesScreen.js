import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

const MatchesScreen = ({navigation}) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMatches = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log(' Loading matches for user:', user.email);
        
        // Get matches from API
        const matchesData = await apiService.getMatches();
        console.log(' Matches API response:', matchesData);
        setMatches(matchesData || []);
        
      } catch (error) {
        console.error(' Error loading matches:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadMatches);
    loadMatches();
    return unsubscribe;
  }, [navigation, user]);

  const handleChatPress = (match) => {
    console.log('💬 Starting chat with:', match);
    navigation.navigate('Chat', { match });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={matches}
          keyExtractor={(item) => item._id || item.id}
          ListEmptyComponent={<Text style={styles.empty}>No matches yet. Start swiping to find your perfect match! 💕</Text>}
          renderItem={({item}) => {
            // Determine which user is the other person not current use
            const otherUser = item.userOne?._id === user?.id ? item.userTwo : item.userOne;
            
            return (
              <View style={styles.card}>
                {otherUser?.profilePicture && (
                  <Image 
                    source={{ uri: otherUser.profilePicture }} 
                    style={styles.profileImage} 
                  />
                )}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                      <Text style={styles.cardText}>
                        {otherUser?.name || 'Unknown User'}
                        {otherUser?.age ? `, ${otherUser.age}` : ''}
                      </Text>
                      <Text style={styles.subtitle}>{otherUser?.role || 'Role not specified'}</Text>
                      <Text style={styles.location}>{otherUser?.location || 'Location not specified'}</Text>
                      <Text style={styles.matchDate}>Matched on {new Date(item.createdAt || Date.now()).toLocaleDateString()}</Text>
                    </View>
                    
                    {/* Chat Button */}
                    <TouchableOpacity 
                      style={styles.chatButton}
                      onPress={() => handleChatPress(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.chatIcon}>💬</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F2' },
  header: { padding: 16, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#FF6B6B' },
  list: { padding: 16 },
  empty: { textAlign: 'center', color: '#666', marginTop: 20, fontSize: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  cardText: { 
    color: '#333', 
    fontSize: 18, 
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  location: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  matchDate: {
    color: '#FF6B6B',
    fontSize: 12,
    fontStyle: 'italic',
  },
  chatButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  chatIcon: {
    fontSize: 20,
    color: 'white',
  },
});

export default MatchesScreen;


