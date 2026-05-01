import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const LikeButton = ({ trackId, size = 20, className = '' }) => {
  const { likedTrackIds, toggleLikeTrack, loading } = useFavorites();
  const isLiked = likedTrackIds.has(trackId);

  const handleClick = async (e) => {
    e.stopPropagation(); // предотвращаем запуск проигрывания трека
    try {
      await toggleLikeTrack(trackId);
    } catch (err) {
      // здесь можно показать уведомление
    }
  };

  return (
    <button
      className={`like-button ${className}`}
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
      aria-label={isLiked ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      {isLiked ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default LikeButton;