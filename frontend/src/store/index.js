import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

// Import only the slices we actually use
import matchesReducer from './slices/matchesSlice';
import favoritesReducer from './slices/favoritesSlice';
import profilesReducer from './slices/profilesSlice';

// Root reducer - combining all slices
const rootReducer = combineReducers({
  matches: matchesReducer,
  favorites: favoritesReducer,
  profiles: profilesReducer,
});

// Basic persist config - only persist what we need
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['favorites', 'matches'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with minimal settings
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
