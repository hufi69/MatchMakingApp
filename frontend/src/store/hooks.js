import { useDispatch, useSelector } from 'react-redux';


export const useAppDispatch = () => useDispatch();
export const useAppSelector = (selector) => useSelector(selector);
export const useMatchesState = () => {
  const matches = useAppSelector(state => state.matches.matches);
  const isLoading = useAppSelector(state => state.matches.isLoading);
  const error = useAppSelector(state => state.matches.error);
  
  return { matches, isLoading, error };
};


export const useFavoritesState = () => {
  const favorites = useAppSelector(state => state.favorites.favorites);
  const isLoading = useAppSelector(state => state.favorites.isLoading);
  const error = useAppSelector(state => state.favorites.error);
  
  return { favorites, isLoading, error };
};

export const useProfilesState = () => {
  const profiles = useAppSelector(state => state.profiles.profiles);
  const currentProfile = useAppSelector(state => state.profiles.profiles[state.profiles.currentIndex]);
  const currentIndex = useAppSelector(state => state.profiles.currentIndex);
  const isLoading = useAppSelector(state => state.profiles.isLoading);
  const totalProfiles = useAppSelector(state => state.profiles.totalProfiles);
  
  return { profiles, currentProfile, currentIndex, isLoading, totalProfiles };
};
