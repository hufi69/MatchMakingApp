import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Async thunk for fetching profiles by role
export const fetchProfilesByRole = createAsyncThunk(
  'profiles/fetchProfilesByRole',
  async (role, { rejectWithValue }) => {
    try {
      const response = await apiService.getProfilesByRole(role);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profiles');
    }
  }
);

// Initial state
const initialState = {
  profiles: [],
  currentProfile: null,
  currentIndex: 0,
  isLoading: false,
  error: null,
  totalProfiles: 0,
};

// Profiles slice
const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    // Set profiles manually (for dispatch compatibility)
    setProfiles: (state, action) => {
      state.profiles = action.payload;
      state.totalProfiles = action.payload.length;
      state.currentIndex = 0;
      state.currentProfile = action.payload.length > 0 ? action.payload[0] : null;
    },
    
    // Move to next profile
    nextProfile: (state) => {
      if (state.currentIndex < state.profiles.length - 1) {
        state.currentIndex += 1;
        state.currentProfile = state.profiles[state.currentIndex];
      }
    },
    
    // Move to previous profile
    previousProfile: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        state.currentProfile = state.profiles[state.currentIndex];
      }
    },
    
    // Set current index
    setCurrentIndex: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.profiles.length) {
        state.currentIndex = index;
        state.currentProfile = state.profiles[index];
      }
    },
    
    // Reset profiles state
    resetProfiles: (state) => {
      state.profiles = [];
      state.currentProfile = null;
      state.currentIndex = 0;
      state.totalProfiles = 0;
    },
    
    // Add a profile
    addProfile: (state, action) => {
      state.profiles.push(action.payload);
      if (state.profiles.length === 1) {
        state.currentProfile = action.payload;
      }
    },
    
    // Remove a profile
    removeProfile: (state, action) => {
      const profileId = action.payload;
      state.profiles = state.profiles.filter(profile => profile._id !== profileId);
      
      // Adjust current index if needed
      if (state.currentIndex >= state.profiles.length) {
        state.currentIndex = Math.max(0, state.profiles.length - 1);
      }
      
      // Update current profile
      if (state.profiles.length > 0) {
        state.currentProfile = state.profiles[state.currentIndex];
      } else {
        state.currentProfile = null;
      }
    },
    
    // Update a profile
    updateProfile: (state, action) => {
      const { id, updates } = action.payload;
      const profileIndex = state.profiles.findIndex(profile => profile._id === id);
      if (profileIndex !== -1) {
        state.profiles[profileIndex] = { ...state.profiles[profileIndex], ...updates };
        
        // Update current profile if it's the one being updated
        if (profileIndex === state.currentIndex) {
          state.currentProfile = state.profiles[profileIndex];
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch profiles
    builder
      .addCase(fetchProfilesByRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfilesByRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profiles = action.payload;
        state.totalProfiles = action.payload.length;
        
        // Set current index and profile to first profile
        if (action.payload.length > 0) {
          state.currentIndex = 0;
          state.currentProfile = action.payload[0];
        } else {
          state.currentProfile = null;
        }
      })
      .addCase(fetchProfilesByRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { 
  setProfiles,
  nextProfile, 
  previousProfile, 
  setCurrentIndex, 
  resetProfiles,
  addProfile, 
  removeProfile, 
  updateProfile 
} = profilesSlice.actions;

// Export selectors
export const selectProfiles = (state) => state.profiles.profiles;
export const selectCurrentProfile = (state) => state.profiles.profiles[state.profiles.currentIndex];
export const selectCurrentIndex = (state) => state.profiles.currentIndex;
export const selectProfilesLoading = (state) => state.profiles.isLoading;
export const selectProfilesError = (state) => state.profiles.error;
export const selectTotalProfiles = (state) => state.profiles.totalProfiles;

export default profilesSlice.reducer;
