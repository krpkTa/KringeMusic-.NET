import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import '../Styles/PlayerPage.css';
import { FaRegClock } from 'react-icons/fa';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const PlayerPage = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);

  // === Загрузка популярных треков при монтировании ===
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const data = await api.getTracks('', 1, 20);
        setTracks(data);
        if (data.length > 0 && !currentTrack) {
          setCurrentTrack(data[0]);
        }
      } catch (err) {
        console.error('Ошибка загрузки треков', err);
      }
    };
    fetchTracks();
  }, []);

  const playTrack = useCallback((track) => {
    if (!track) return;
    setCurrentTrack(track);
  }, []);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // === Рендер строки трека в таблице ===
  const TrackRow = ({ track, index }) => (
    <div className="track-row" onClick={() => playTrack(track)}>
      <span className="track-number">{index + 1}</span>
      <div className="track-info">
        {track.coverUrl && <img src={`http://localhost:5043${track.coverUrl}`} className="track-cover" alt="cover" />}
        <div>
          <div className="track-title">{track.name}</div>
          <div className="track-artist">
            {track.artists?.map((a, idx) => (
              <span
                key={a.artistId}
                onClick={(e) => { e.stopPropagation(); navigate(`/artist/${a.artistId}`); }}
                style={{ cursor: 'pointer', textDecoration: 'underline', marginRight: '4px' }}
              >
                {a.name}{idx < track.artists.length - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
      <span className="track-plays">—</span>
      <span className="track-duration">{formatTime(track.duration)}</span>
    </div>
  );

  return (
    <Layout currentTrack={currentTrack} onTrackPlay={playTrack} playerTracks={tracks}>
      <section className="featured">
        <h2>Привет, слушатель!</h2>
        <div className="recs-grid">
          <div className="rec-card">🎧 Плейлист дня</div>
          <div className="rec-card">📈 Топ-50 Россия</div>
          <div className="rec-card">✨ Новинки недели</div>
          <div className="rec-card">🎤 Подкасты</div>
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
          {tracks.map((track, idx) => (
            <TrackRow key={track.trackId} track={track} index={idx} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default PlayerPage;