import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext'; // если у вас есть контекст авторизации

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth(); // получаем текущего пользователя (или используйте localStorage)
  const [likedTrackIds, setLikedTrackIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Загружаем ID всех избранных треков при авторизации
  const loadFavorites = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Для простоты возьмём первые 1000 треков (или сделайте цикл по страницам)
      const res = await api.getFavorites(1, 1000);
      const ids = res.items.map(t => t.trackId);
      setLikedTrackIds(new Set(ids));
    } catch (err) {
      console.error('Failed to load favorites', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const likeTrack = async (trackId) => {
    if (likedTrackIds.has(trackId)) return;
    try {
      await api.likeTrack(trackId);
      setLikedTrackIds(prev => new Set([...prev, trackId]));
    } catch (err) {
      console.error('Like error', err);
      throw err;
    }
  };

  const unlikeTrack = async (trackId) => {
    if (!likedTrackIds.has(trackId)) return;
    try {
      await api.unlikeTrack(trackId);
      setLikedTrackIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(trackId);
        return newSet;
      });
    } catch (err) {
      console.error('Unlike error', err);
      throw err;
    }
  };

  const toggleLike = (trackId) => {
    if (likedTrackIds.has(trackId)) {
      return unlikeTrack(trackId);
    } else {
      return likeTrack(trackId);
    }
  };

  return (
    <FavoritesContext.Provider value={{
      likedTrackIds,
      likeTrack,
      unlikeTrack,
      toggleLike,
      loadFavorites,
      loading
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};