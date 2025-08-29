import React, {useEffect, useMemo, useRef, useState} from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { useProfilesState, useFavoritesState, useMatchesState, useAppDispatch } from '../store/hooks';
import { setProfiles, setCurrentIndex } from '../store/slices/profilesSlice';
import { setFavorites } from '../store/slices/favoritesSlice';
import { setMatches } from '../store/slices/matchesSlice';

const HomeScreen = ({navigation}) => {
  const { user, logout } = useAuth();
  
  // redux hooks for state management
  const dispatch = useAppDispatch();
  
  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({index: 0, routes: [{name: 'Login'}]});
          }
        }
      ]
    );
  };
  const { profiles, currentIndex, isLoading: profilesLoading } = useProfilesState();
  const { favorites, isLoading: favoritesLoading } = useFavoritesState();
  const { matches, isLoading: matchesLoading } = useMatchesState();
  
  // local loading state for ui operations
  const [loading, setLoading] = useState(false);
  
  // debug logging
  console.log('HomeScreen rendered');
  console.log('User from context:', user);
  console.log('Redux profiles:', profiles?.length);
  console.log('Redux favorites:', favorites?.length);
  console.log('Redux matches:', matches?.length);

  const currentProfile = profiles[currentIndex];
  const currentRoleKey = useMemo(() => (user?.role === 'influencer' ? 'influencer' : 'brand'), [user?.role]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log('🔄 Loading data for user role:', user?.role);
        
        // Verify apiService is available
        if (!apiService) {
          console.error(' apiService is undefined!');
          return;
        }
        
        // Load profiles
        console.log('👥 Loading profiles for role:', user?.role === 'brand' ? 'influencer' : 'brand');
        const profilesResponse = await apiService.getProfilesByRole(user?.role === 'brand' ? 'influencer' : 'brand');
        console.log('📊 Profiles response:', profilesResponse);
        
        // Extract profiles data from response
        const profilesData = profilesResponse?.data || profilesResponse || [];
        dispatch(setProfiles(profilesData));
        console.log('👥 Set profiles:', profilesData.length);
        
        // Load favorites
        console.log('📱 Loading favorites...');
        const favoritesData = await apiService.getFavorites();
        dispatch(setFavorites(favoritesData || []));
        
        // Load matches
        console.log(' Loading matches...');
        const matchesData = await apiService.getMatches();
        dispatch(setMatches(matchesData || []));
        
      } catch (error) {
        console.error(' Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadData();
    }
  }, [user]);

  const handleLike = async () => {
    if (!currentProfile) return;
    
    try {
      console.log('Adding to favorites:', currentProfile);
      
      // Add to favorites via API
      const result = await apiService.addFavorite(currentProfile._id || currentProfile.id);
      console.log('Add favorite response:', result);
      
      if (result) {
        // Check if this created a new match by looking for the favorite in the response
        if (result.favorite) {
          console.log(' Favorite added successfully');
          
          // Refresh favorites list
          const favoritesData = await apiService.getFavorites();
          dispatch(setFavorites(favoritesData || []));
          
          // Check if we have a mutual match by refreshing matches
          const matchesData = await apiService.getMatches();
          dispatch(setMatches(matchesData || []));
          
          // Check if this profile is now in our matches
          const hasMatch = matchesData?.some(match => 
            (match.userOne?._id === currentProfile?._id || match.userTwo?._id === currentProfile?._id) ||
            (match.userOne === currentProfile?._id || match.userTwo === currentProfile?._id)
          );
          
          if (hasMatch) {
            console.log('🎉 New match found!');
            Alert.alert(
              ' New Match!',
              `You and ${currentProfile?.name || 'someone'} liked each other! It's a match! 💕`,
              [{ text: 'View Matches', onPress: () => navigation.navigate('Matches') }]
            );
          }
        }
        
        // Move to next profile
        if (currentIndex < profiles.length - 1) {
          dispatch(setCurrentIndex(currentIndex + 1));
        } else {
          // Reset to beginning
          console.log(' Reached end of profiles, resetting to beginning...');
          dispatch(setCurrentIndex(0));
          Alert.alert(
            ' Profiles Reset',
            'You\'ve seen all profiles! Starting over from the beginning.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error(' Error adding favorite:', error);
      Alert.alert('Error', 'Failed to add favorite. Please try again.');
    }
  };

  const handleDislike = () => {
    // Move to next profile
    if (currentIndex < profiles.length - 1) {
      dispatch(setCurrentIndex(currentIndex + 1));
    }
  };
  
  // Swipe right gesture for logout (only on the very edge of screen)
  const swipeRight = Gesture.Pan()
    .onBegin((e) => {
      // Only activate if swipe starts from the very right edge
      if (e.x < 50) {
        return true;
      }
      return false;
    })
    .onEnd(async (e) => {
      // Require longer swipe and confirm with alert
      if (e.translationX > 150) {
        Alert.alert(
          'Logout',
          'Swipe right again to confirm logout',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Logout', 
              style: 'destructive',
              onPress: async () => {
                await logout();
                navigation.reset({index: 0, routes: [{name: 'Login'}]});
              }
            }
          ]
        );
      }
    });

  // Swipe left gesture to go to login screen
  const swipeLeft = Gesture.Pan()
    .onEnd((e) => {
      // If user swipes left, navigate to login
      if (e.translationX < -100) {
        navigation.navigate('Login');
      }
    });

  const isCurrentProfileLiked = useMemo(() => {
    return favorites.some(fav => fav.favoriteUserId?._id === currentProfile?._id || fav.favoriteUserId === currentProfile?._id);
  }, [favorites, currentProfile]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with logout button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match Maker</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
        
        {!loading && !apiService && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>API Service not available</Text>
          </View>
        )}
        
        {profiles.length === 0 && !loading ? (
          <View style={styles.noProfilesContainer}>
            <Text style={styles.noProfilesText}>No profiles available</Text>
            <Text style={styles.noProfilesSubtext}>Try refreshing or check back later</Text>
          </View>
        ) : (
          <View style={styles.card}>
                      <Image 
              source={{ 
                uri: currentProfile?.profilePicture || currentProfile?.photo || 'https://via.placeholder.com/400x600?text=No+Photo' 
              }} 
              style={styles.photo} 
            />

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={handleDislike} activeOpacity={0.8} style={[styles.smallFab, styles.reject]}> 
              <Text style={styles.actionSymbol}>×</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={isCurrentProfileLiked ? null : handleLike} 
              activeOpacity={isCurrentProfileLiked ? 1 : 0.8} 
              style={[
                styles.bigFab,
                isCurrentProfileLiked && styles.favorited
              ]}
            >
              <Text style={styles.actionHeart}>
                {isCurrentProfileLiked ? '💖' : '❤'}
              </Text>
            </TouchableOpacity>
            
            {/* Show small indicator if already liked */}
            {isCurrentProfileLiked && (
              <View style={styles.likedIndicator}>
                <Text style={styles.likedIndicatorText}>✓ Liked</Text>
              </View>
            )}
                          <TouchableOpacity onPress={() => navigation.navigate('Matches')} activeOpacity={0.8} style={[styles.smallFab, styles.star]}> 
                <Text style={styles.actionSymbol}>★</Text>
                {matches.length > 0 && (
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchBadgeText}>{matches.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            
          </View>
          

          <View style={styles.infoBox}>
                        <View style={styles.titleRow}>
              <Text style={styles.name}>
                {currentProfile?.name || 'No Name'}{currentProfile?.age ? `, ${currentProfile.age}` : ''}
                {matches.some(match => 
                  (match.userOne?._id === currentProfile?._id || match.userTwo?._id === currentProfile?._id) ||
                  (match.userOne === currentProfile?._id || match.userTwo === currentProfile?._id)
                ) && (
                  <Text style={{ color: '#FF1493', fontSize: 16, marginLeft: 8 }}>💕</Text>
                )}
              </Text>
              <Text style={styles.distance}>{currentProfile?.location || 'Location not specified'}</Text>
            </View>
            <Text style={styles.subtitle}>You are logged in as: {currentRoleKey}</Text>
            <Text style={styles.subtitle}>{currentProfile?.role || 'Role not specified'}</Text>

            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.about}>{currentProfile?.about || 'No description available'}</Text>

            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.chipsRow}>
              {(currentProfile?.interests || []).map(label => (
                <View key={label} style={styles.chip}>
                  <Text style={styles.chipText}>{label}</Text>
                </View>
              ))}
            </View>
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: '#666', fontSize: 16, fontWeight: '600' }}>
                ❤️ Favorites: {favorites.length}
              </Text>
              <Text style={{ color: '#666', fontSize: 14 }}>
                📍 Current Profile: {currentIndex + 1} of {profiles.length}
              </Text>
              {favorites.length > 0 && (
                <Text style={{ color: '#FF6B6B', fontSize: 14, marginTop: 4 }}>
                  💫 You have {favorites.length} favorite{favorites.length > 1 ? 's' : ''}!
                </Text>
              )}
              {matches.length > 0 && (
                <Text style={{ color: '#FF1493', fontSize: 14, marginTop: 4 }}>
                  🎉 You have {matches.length} match{matches.length > 1 ? 'es' : ''}!
                </Text>
              )}
            </View>
          </View>
        </View>
        )}
        {/* Refresh Button */}
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={async () => {
            try {
              setLoading(true);
              console.log(' Refreshing profiles...');
              
              // Reload profiles
              const profilesResponse = await apiService.getProfilesByRole(user?.role === 'brand' ? 'influencer' : 'brand');
              const profilesData = profilesResponse?.data || profilesResponse || [];
              dispatch(setProfiles(profilesData));
              
              // Reset to first profile
              dispatch(setCurrentIndex(0));
              
              console.log('Refreshed profiles:', profilesData.length);
              Alert.alert('Success', `Refreshed ${profilesData.length} profiles!`);
            } catch (error) {
              console.error(' Error refreshing profiles:', error);
              Alert.alert('Error', 'Failed to refresh profiles. Please try again.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Text style={styles.refreshButtonText}> Refresh Profiles</Text>
        </TouchableOpacity>
        
        {/* Profile Counter */}
        {profiles.length > 0 && (
          <View style={styles.profileCounter}>
            <Text style={styles.profileCounterText}>
              Profile {currentIndex + 1} of {profiles.length}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Swipe right gesture detector (only for edge swipes) */}
      <GestureDetector gesture={swipeRight}>
        <View style={styles.gestureArea} />
      </GestureDetector>
      
      {/* Swipe left gesture detector for navigation */}
      <GestureDetector gesture={swipeLeft}>
        <View style={styles.leftGestureArea} />
      </GestureDetector>
    </SafeAreaView>
  );
};

const PINK = '#FF6B6B';
const LIGHT_PINK = '#FFD6E2';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F2' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  container: { padding: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  photo: { width: '100%', height: 360 },
  actionsRow: {
    marginTop: -40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  smallFab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  bigFab: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: PINK,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  favorited: {
    backgroundColor: '#FF1493', // Hot pink for favorited state
  },
  reject: { borderWidth: 0 },
  star: { borderWidth: 0 },
  actionSymbol: { fontSize: 28, color: PINK, fontWeight: '700' },
  actionHeart: { fontSize: 28, color: 'white', fontWeight: '700' },
  favoritedHeart: { fontSize: 28, color: 'white', fontWeight: '700' },
  matchBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF1493',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoBox: { padding: 20 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 24, fontWeight: '800', color: '#222' },
  distance: { color: '#666' },
  subtitle: { marginTop: 4, color: '#666' },
  sectionTitle: { marginTop: 18, fontWeight: '700', color: '#333' },
  about: { marginTop: 6, color: '#666', lineHeight: 20 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  chip: {
    backgroundColor: LIGHT_PINK,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { color: '#8A4A5C' },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  noProfilesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noProfilesText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  noProfilesSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  likedIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF1493',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    zIndex: 1,
  },
  likedIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: PINK,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileCounter: {
    backgroundColor: '#FFD6E2',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 10,
  },
  profileCounterText: {
    color: '#8A4A5C',
    fontSize: 14,
    fontWeight: '600',
  },
  gestureArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 50,
    zIndex: 1,
  },
  leftGestureArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 50,
    zIndex: 1,
  },
});

export default HomeScreen;


