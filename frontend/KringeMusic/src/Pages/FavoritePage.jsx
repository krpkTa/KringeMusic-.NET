import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import LikeButton from '../components/LikeButton';
import { FaRegClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../Styles/FavoritesPage.css';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentTrack, setCurrentTrack] = useState(null);

  const fetchFavorites = async (currentPage) => {
    setLoading(true);
    try {
      const res = await api.getFavorites(currentPage, 20);
      setTracks(res.items);
      setTotalPages(Math.ceil(res.totalCount / 20));
    } catch (err) {
      console.error('Failed to load favorites', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites(page);
  }, [page]);

  const playTrack = (track) => {
    setCurrentTrack(track);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const TrackRow = ({ track, index }) => (
    <div className="track-row" onClick={() => playTrack(track)}>
      <span className="track-number">{index + 1}</span>
      <div className="track-info">
        {track.coverLink && <img src={`http://localhost:5043${track.coverLink}`} className="track-cover" alt="cover" />}
        <div>
          <div className="track-title">{track.name}</div>
          <div className="track-artist">—</div> {/* если API не возвращает artists, можно доработать */}
        </div>
      </div>
      <span className="track-duration">{formatDuration(track.duration)}</span>
      <LikeButton trackId={track.trackId} size={18} className="track-like" />
    </div>
  );

  return (
    <Layout currentTrack={currentTrack} playerTracks={tracks}>
      <div className="favorites-page">
        <h1>Мои любимые треки</h1>
        {loading && <div>Загрузка...</div>}
        {!loading && tracks.length === 0 && (
          <div className="empty-state">Нет избранных треков. Нажмите ♡ на любом треке, чтобы добавить.</div>
        )}
        {tracks.length > 0 && (
          <div className="tracks-table">
            <div className="table-header">
              <span>#</span><span>Название</span><span>Длительность</span><span></span>
            </div>
            {tracks.map((track, idx) => (
              <TrackRow key={track.trackId} track={track} index={idx} />
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} disabled={p === page}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;