import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const AlbumLikeButton = ({ artistId, albumId, size = 20, className = '' }) => {
  const { likedAlbumKeys, toggleLikeAlbum, loading } = useFavorites();
  const key = `${artistId}_${albumId}`;
  const isLiked = likedAlbumKeys.has(key);

  const handleClick = async (e) => {
    e.stopPropagation();
    try {
      await toggleLikeAlbum(artistId, albumId);
    } catch (err) {
      // обработать ошибку (показать уведомление)
    }
  };

  return (
    <button
      className={`album-like-button ${className}`}
      onClick={handleClick}
      disabled={loading}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        color: isLiked ? '#ff4d4d' : '#888',
        fontSize: size,
        transition: 'color 0.2s'
      }}
      aria-label={isLiked ? 'Удалить из избранных альбомов' : 'Добавить альбом в избранное'}
    >
      {isLiked ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default AlbumLikeButton;