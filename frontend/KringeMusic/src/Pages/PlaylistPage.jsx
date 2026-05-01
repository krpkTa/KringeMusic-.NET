import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';
import LikeButton from '../components/LikeButton';
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import '../Styles/PlaylistPage.css';

const PlaylistPage = () => {
  const { typeId, userId, playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [addingTrack, setAddingTrack] = useState(false);

  const isSystem = parseInt(typeId) === 1; // системный плейлист ≠ редактирование

  useEffect(() => {
    fetchPlaylistData();
  }, [typeId, userId, playlistId]);

  const fetchPlaylistData = async () => {
    setLoading(true);
    try {
      // Получить информацию о плейлисте? У нас нет отдельного эндпоинта,
      // но можно получить из списка плейлистов пользователя. Для простоты – запросим треки
      const tracksRes = await api.getPlaylistTracks(typeId, userId, playlistId, 1, 100);
      setTracks(tracksRes.items || []);
      // Имя плейлиста можно получить из localStorage? Или добавить эндпоинт GET /playlist/{id}
      // Временно: попробуем получить все плейлисты пользователя и найти нужный
      try {
        const allPlaylists = await api.getUserPlaylists();
        const found = allPlaylists.find(p => p.typeId === parseInt(typeId) && p.userId === parseInt(userId) && p.playlistId === parseInt(playlistId));
        if (found) setPlaylist(found);
      } catch (err) {
        console.error('Failed to fetch playlist info', err);
        setPlaylist({ name: 'Плейлист', typeId: parseInt(typeId) });
      }
    } catch (err) {
      console.error('Failed to fetch playlist tracks', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = async (track) => {
    setCurrentTrack(track);
    try {
      await api.recordPlayHistory(track.trackId, 'playlist_page', 1, false);
    } catch (err) {
      console.error('Failed to record history', err);
    }
  };

  const handleRemoveTrack = async (trackId) => {
    if (!window.confirm('Удалить трек из плейлиста?')) return;
    try {
      await api.removeTrackFromPlaylist(parseInt(typeId), parseInt(userId), parseInt(playlistId), trackId);
      // Обновить локально
      setTracks(tracks.filter(t => t.trackId !== trackId));
    } catch (err) {
      console.error('Failed to remove track', err);
    }
  };

  const handleSearchTracks = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await api.searchTracks(query, 1, 20);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const handleAddTrack = async (trackId) => {
    setAddingTrack(true);
    try {
      await api.addTrackToPlaylist(parseInt(typeId), parseInt(userId), parseInt(playlistId), trackId);
      // Обновить список треков – перезагрузить
      await fetchPlaylistData();
      setShowAddModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Failed to add track', err);
    } finally {
      setAddingTrack(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCoverUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5043${url}`;
  };

  if (loading) return <Layout><div className="loading">Загрузка...</div></Layout>;

  return (
    <Layout currentTrack={currentTrack} playerTracks={tracks}>
      <div className="playlist-page">
        <div className="playlist-header">
          <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft /> Назад</button>
          <div className="playlist-info">
            <h1>{playlist?.name || 'Плейлист'}</h1>
            <p>{tracks.length} треков</p>
          </div>
          {!isSystem && (
            <button className="add-tracks-btn" onClick={() => setShowAddModal(true)}>
              <FaPlus /> Добавить треки
            </button>
          )}
        </div>

        <div className="tracks-table">
          <div className="track-header">
            <span>#</span>
            <span>Название</span>
            <span>Длительность</span>
            {!isSystem && <span></span>}
          </div>
          {tracks.map((track, idx) => (
            <div key={track.trackId} className="track-row" onClick={() => handlePlayTrack(track)}>
              <span className="track-index">{idx + 1}</span>
              <div className="track-info">
                {getCoverUrl(track.coverUrl) && (
                  <img src={getCoverUrl(track.coverUrl)} className="track-cover" alt="" />
                )}
                <div>
                  <div className="track-name">{track.name}</div>
                  <div className="track-artist">
                    {track.artists?.map(a => a.name).join(', ') || 'Unknown'}
                  </div>
                </div>
              </div>
              <span className="track-duration">{formatDuration(track.duration)}</span>
              {!isSystem && (
                <button
                  className="remove-track-btn"
                  onClick={(e) => { e.stopPropagation(); handleRemoveTrack(track.trackId); }}
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          {tracks.length === 0 && <div className="empty-message">В плейлисте пока нет треков</div>}
        </div>

        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Добавить треки</h3>
              <input
                type="text"
                placeholder="Поиск треков..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onInput={e => handleSearchTracks(e.target.value)}
                autoFocus
              />
              <div className="search-results">
                {searchResults.map(track => (
                  <div key={track.trackId} className="search-result-item">
                    <div className="result-info">
                      <span className="result-name">{track.name}</span>
                      <span className="result-artist">
                        {track.artists?.map(a => a.name).join(', ')}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddTrack(track.trackId)}
                      disabled={addingTrack}
                    >
                      Добавить
                    </button>
                  </div>
                ))}
                {searchQuery && searchResults.length === 0 && <div className="no-results">Ничего не найдено</div>}
              </div>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>Закрыть</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PlaylistPage;