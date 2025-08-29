import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Async thunk for fetching matches
export const fetchMatches = createAsyncThunk(
  'matches/fetchMatches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getMatches();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch matches');
    }
  }
);

// Initial state
const initialState = {
  matches: [],
  isLoading: false,
  error: null,
};

// Matches slice
const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    // Set matches manually (for dispatch compatibility)
    setMatches: (state, action) => {
      state.matches = action.payload;
    },
    
    // Add match manually
    addMatchManually: (state, action) => {
      state.matches.push(action.payload);
    },
    
    
    removeMatch: (state, action) => {
      state.matches = state.matches.filter(match => match._id !== action.payload);
    },
    
    // Clear all matches
    clearMatches: (state) => {
      state.matches = [];
    },
    
    // Update a match
    updateMatch: (state, action) => {
      const { id, updates } = action.payload;
      const matchIndex = state.matches.findIndex(match => match._id === id);
      if (matchIndex !== -1) {
        state.matches[matchIndex] = { ...state.matches[matchIndex], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch matches
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.matches = action.payload;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions 
export const { 
  setMatches,
  addMatchManually, 
  removeMatch, 
  clearMatches, 
  updateMatch 
} = matchesSlice.actions;

// Export selectors
export const selectMatches = (state) => state.matches.matches;
export const selectMatchesLoading = (state) => state.matches.isLoading;
export const selectMatchesError = (state) => state.matches.error;

export default matchesSlice.reducer;
