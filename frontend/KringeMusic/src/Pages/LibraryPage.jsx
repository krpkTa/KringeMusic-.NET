import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { FaHeart, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../Styles/LibraryPage.css';

const LibraryPage = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [favoriteAlbums, setFavoriteAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const fetchLibraryData = async () => {
    setLoading(true);
    try {
      const [playlistsRes, albumsRes] = await Promise.all([
        api.getUserPlaylists(),
        api.getFavoriteAlbums(1, 50)
      ]);
      console.log('[LibraryPage] Playlists:', playlistsRes);
      console.log('[LibraryPage] FavoriteAlbums response:', albumsRes);
      setPlaylists(playlistsRes);
      
      // Обработка разных возможных структур данных
      const albums = albumsRes?.items || albumsRes?.data || albumsRes || [];
      console.log('[LibraryPage] Processed albums:', albums);
      setFavoriteAlbums(Array.isArray(albums) ? albums : []);
    } catch (err) {
      console.error('Failed to load library', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      await api.createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setShowCreateModal(false);
      fetchLibraryData();
    } catch (err) {
      console.error('Failed to create playlist', err);
    }
  };

  const handleDeletePlaylist = async (playlist) => {
    if (playlist.typeId === 1) return; // нельзя удалить системный плейлист избранного
    if (window.confirm(`Удалить плейлист "${playlist.name}"?`)) {
      try {
        await api.deletePlaylist(playlist.typeId, playlist.userId, playlist.playlistId);
        fetchLibraryData();
      } catch (err) {
        console.error('Failed to delete playlist', err);
      }
    }
  };

  const getCoverUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5043${url}`;
  };

  const PlaylistCard = ({ playlist }) => {
    const isSystem = playlist.typeId === 1;
    return (
      <div className="library-card" onClick={() => navigate(`/playlist/${playlist.typeId}/${playlist.userId}/${playlist.playlistId}`)}>
        <div className="card-cover">
          {playlist.coverUrl ? (
            <img src={getCoverUrl(playlist.coverUrl)} alt={playlist.name} />
          ) : (
            <div className="card-cover-placeholder">
              {isSystem ? <FaHeart size={32} /> : '📀'}
            </div>
          )}
        </div>
        <div className="card-info">
          <h4>{playlist.name}</h4>
          <p>{playlist.trackCount} треков</p>
        </div>
        {!isSystem && (
          <button
            className="delete-playlist-btn"
            onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(playlist); }}
          >
            🗑️
          </button>
        )}
      </div>
    );
  };

  const AlbumCard = ({ album }) => (
    <div className="library-card" onClick={() => navigate(`/artist/${album.artistId}/album/${album.albumId}`)}>
      <div className="card-cover">
        {album.coverLink ? (
          <img src={getCoverUrl(album.coverLink)} alt={album.name} />
        ) : (
          <div className="card-cover-placeholder">🎵</div>
        )}
      </div>
      <div className="card-info">
        <h4>{album.name}</h4>
        <p>{album.artistName}</p>
      </div>
    </div>
  );

  if (loading) return <Layout><div className="loading">Загрузка...</div></Layout>;

  return (
    <Layout>
      <div className="library-page">
        <div className="library-header">
          <h1>Библиотека</h1>
          <button className="create-playlist-btn" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Новый плейлист
          </button>
        </div>

        <section className="library-section">
          <h2>Плейлисты</h2>
          <div className="cards-grid">
            {playlists.map(pl => <PlaylistCard key={`${pl.typeId}-${pl.playlistId}`} playlist={pl} />)}
            {playlists.length === 0 && <div className="empty-message">У вас ещё нет плейлистов</div>}
          </div>
        </section>

        <section className="library-section">
          <h2>Любимые альбомы</h2>
          <div className="cards-grid">
            {favoriteAlbums.map(album => <AlbumCard key={album.albumId} album={album} />)}
            {favoriteAlbums.length === 0 && <div className="empty-message">Нет любимых альбомов</div>}
          </div>
        </section>

        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Новый плейлист</h3>
              <input
                type="text"
                placeholder="Название плейлиста"
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                autoFocus
              />
              <div className="modal-buttons">
                <button onClick={() => setShowCreateModal(false)}>Отмена</button>
                <button onClick={handleCreatePlaylist}>Создать</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LibraryPage;