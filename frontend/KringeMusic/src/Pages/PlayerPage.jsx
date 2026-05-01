import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import '../Styles/PlayerPage.css';
import { FaRegClock } from 'react-icons/fa';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import LikeButton from '../components/LikeButton';
import { useAuth } from '../context/AuthContext';

const PlayerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ждём авторизацию
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyPlaylist, setDailyPlaylist] = useState(null);
  const [loadingDaily, setLoadingDaily] = useState(true);

  // Загрузка популярных треков
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const response = await api.getTracks('', 1, 20);
        const tracksList = Array.isArray(response) ? response : response.items || [];
        setTracks(tracksList);
      } catch (err) {
        console.error('Ошибка загрузки треков', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  // Загрузка плейлиста дня (только когда пользователь авторизован)
  useEffect(() => {
    if (!user) return;
    const fetchDaily = async () => {
      setLoadingDaily(true);
      try {
        const playlist = await api.getDailyPlaylist();
        setDailyPlaylist(playlist);
      } catch (err) {
        console.error('Failed to load daily playlist', err);
      } finally {
        setLoadingDaily(false);
      }
    };
    fetchDaily();
  }, [user]);

  const playTrack = useCallback(async (track) => {
    if (!track) return;
    setCurrentTrack(track);
    try {
      await api.recordPlayHistory(track.trackId, 'player_page', 1, false);
    } catch (err) {
      console.error('Не удалось записать историю', err);
    }
  }, []);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === undefined) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCoverUrl = (coverUrl) => {
    if (!coverUrl) return null;
    if (coverUrl.startsWith('http')) return coverUrl;
    return `http://localhost:5043${coverUrl}`;
  };

  const TrackRow = ({ track, index }) => {
    const artistsList = track.artists && Array.isArray(track.artists) ? track.artists : [];
    const coverUrl = getCoverUrl(track.coverUrl);

    return (
      <div className="track-row" onClick={() => playTrack(track)}>
        <span className="track-number">{index + 1}</span>
        <div className="track-info">
          {coverUrl && <img src={coverUrl} className="track-cover" alt="cover" />}
          <div>
            <div className="track-title">{track.name || 'Без названия'}</div>
            <div className="track-artist">
              {artistsList.map((a, idx) => (
                <span
                  key={a.artistId}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/artist/${a.artistId}`);
                  }}
                  style={{ cursor: 'pointer', textDecoration: 'underline', marginRight: '4px' }}
                >
                  {a.name}{idx < artistsList.length - 1 ? ',' : ''}
                </span>
              ))}
              {artistsList.length === 0 && 'Неизвестный исполнитель'}
            </div>
          </div>
        </div>
        <span className="track-plays">—</span>
        <span className="track-duration">{formatTime(track.duration)}</span>
        <LikeButton trackId={track.trackId} size={18} className="track-like" />
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-spinner">Загрузка треков...</div>
      </Layout>
    );
  }

  return (
    <Layout currentTrack={currentTrack} onTrackPlay={playTrack} playerTracks={tracks}>
      <section className="featured">
        <h2>Привет, слушатель!</h2>
        <div className="recs-grid">
          {loadingDaily ? (
            <div className="rec-card loading-daily">Загрузка подборки...</div>
          ) : dailyPlaylist ? (
            <div 
              className="rec-card daily-card" 
              onClick={() => navigate(`/playlist/${dailyPlaylist.typeId}/${dailyPlaylist.userId}/${dailyPlaylist.playlistId}`)}
            >
              <div className="daily-card-content">
                {dailyPlaylist.coverUrl ? (
                  <img src={getCoverUrl(dailyPlaylist.coverUrl)} alt={dailyPlaylist.name} className="daily-cover" />
                ) : (
                  <div className="daily-cover-placeholder">🎧</div>
                )}
                <div className="daily-info">
                  <h3>{dailyPlaylist.name}</h3>
                  <p>{dailyPlaylist.trackCount} треков • подборка на сегодня</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rec-card">🎧 Плейлист дня</div>
          )}
          
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Популярные треки</h2>
          <a href="#" className="see-all">Смотреть все</a>
        </div>
        <div className="tracks-table">
          <div className="table-header">
            <span>#</span><span>Название</span><span>Слушания</span><span><FaRegClock /></span>
          </div>
          {tracks.length === 0 ? (
            <div className="empty-state">Нет доступных треков</div>
          ) : (
            tracks.map((track, idx) => (
              <TrackRow key={track.trackId} track={track} index={idx} />
            ))
          )}
        </div>
      </section>
    </Layout>
  );
};

export default PlayerPage;