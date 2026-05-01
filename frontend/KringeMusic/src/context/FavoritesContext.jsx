import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [likedTrackIds, setLikedTrackIds] = useState(new Set());
  const [likedAlbumKeys, setLikedAlbumKeys] = useState(new Set()); // Set of "artistId_albumId"
  const [loading, setLoading] = useState(false);

  const loadFavorites = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Загрузка избранных треков
      const tracksRes = await api.getFavorites(1, 1000);
      const trackIds = tracksRes.items.map(t => t.trackId);
      setLikedTrackIds(new Set(trackIds));

      // Загрузка избранных альбомов
      const albumsRes = await api.getFavoriteAlbums(1, 1000);
      const albumKeys = albumsRes.items.map(a => `${a.artistId}_${a.albumId}`);
      setLikedAlbumKeys(new Set(albumKeys));
    } catch (err) {
      console.error('Failed to load favorites', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  // ----- Треки -----
  const likeTrack = async (trackId) => {
    if (likedTrackIds.has(trackId)) return;
    try {
      await api.likeTrack(trackId);
      setLikedTrackIds(prev => new Set([...prev, trackId]));
    } catch (err) {
      console.error('Like track error', err);
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
      console.error('Unlike track error', err);
      throw err;
    }
  };

  const toggleLikeTrack = (trackId) => {
    if (likedTrackIds.has(trackId)) {
      return unlikeTrack(trackId);
    } else {
      return likeTrack(trackId);
    }
  };

  // ----- Альбомы -----
  const likeAlbum = async (artistId, albumId) => {
    const key = `${artistId}_${albumId}`;
    if (likedAlbumKeys.has(key)) return;
    try {
      await api.likeAlbum(artistId, albumId);
      setLikedAlbumKeys(prev => new Set([...prev, key]));
    } catch (err) {
      console.error('Like album error', err);
      throw err;
    }
  };

  const unlikeAlbum = async (artistId, albumId) => {
    const key = `${artistId}_${albumId}`;
    if (!likedAlbumKeys.has(key)) return;
    try {
      await api.unlikeAlbum(artistId, albumId);
      setLikedAlbumKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    } catch (err) {
      console.error('Unlike album error', err);
      throw err;
    }
  };

  const toggleLikeAlbum = (artistId, albumId) => {
    const key = `${artistId}_${albumId}`;
    if (likedAlbumKeys.has(key)) {
      return unlikeAlbum(artistId, albumId);
    } else {
      return likeAlbum(artistId, albumId);
    }
  };

  return (
    <FavoritesContext.Provider value={{
      likedTrackIds,
      likeTrack,
      unlikeTrack,
      toggleLikeTrack,
      likedAlbumKeys,
      likeAlbum,
      unlikeAlbum,
      toggleLikeAlbum,
      loadFavorites,
      loading
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};