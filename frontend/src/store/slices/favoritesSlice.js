import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Async thunk for fetching favorites
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getFavorites();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch favorites');
    }
  }
);
export const addFavorite = createAsyncThunk(
  'favorites/addFavorite',
  async (favoriteUserId, { rejectWithValue, getState }) => {
    try {
      
      const state = getState();
      const isAlreadyFavorited = state.favorites.favorites.some(fav =>
        fav.favoriteUserId === favoriteUserId || fav.favoriteUserId._id === favoriteUserId
      );

      if (isAlreadyFavorited) {
        return rejectWithValue('Profile already in favorites');
      }

      const response = await apiService.addFavorite(favoriteUserId);
      return { favoriteUserId, response };
    } catch (error) {
      if (error.message?.includes('duplicate key') || error.message?.includes('already exists')) {
        return rejectWithValue('Profile already in favorites');
      }
      return rejectWithValue(error.message || 'Failed to add favorite');
    }
  }
);


export const removeFavorite = createAsyncThunk(
  'favorites/removeFavorite',
  async (favoriteUserId, { rejectWithValue }) => {
    try {
      const response = await apiService.removeFavorite(favoriteUserId);
      return { favoriteUserId, response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove favorite');
    }
  }
);


const initialState = {
  favorites: [],
  isLoading: false,
  error: null,
};

// Favorites 
const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // Set favorites manually (for dispatch compatibility)
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    
    addFavoriteManually: (state, action) => {
      state.favorites.push(action.payload);
    },
    
    
    removeFavoriteManually: (state, action) => {
      state.favorites = state.favorites.filter(
        fav => fav.favoriteUserId !== action.payload && fav.favoriteUserId._id !== action.payload
      );
    },
    
    
    clearFavorites: (state) => {
      state.favorites = [];
    },
    
  
    isUserFavorited: (state, action) => {
      return state.favorites.some(fav => 
        fav.favoriteUserId === action.payload || fav.favoriteUserId._id === action.payload
      );
    },
  },
  extraReducers: (builder) => {
    
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // Add favorite
    builder
      .addCase(addFavorite.fulfilled, (state, action) => {
        // Favorite already added to state in component
        state.error = null;
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.error = action.payload;
      });
    
    // Remove favorite
    builder
      .addCase(removeFavorite.fulfilled, (state, action) => {
        // Favorite already removed from state in component
        state.error = null;
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { 
  setFavorites,
  addFavoriteManually, 
  removeFavoriteManually, 
  clearFavorites,
  isUserFavorited 
} = favoritesSlice.actions;

// Export selectors
export const selectFavorites = (state) => state.favorites.favorites;
export const selectFavoritesLoading = (state) => state.favorites.isLoading;
export const selectFavoritesError = (state) => state.favorites.error;

export default favoritesSlice.reducer;
