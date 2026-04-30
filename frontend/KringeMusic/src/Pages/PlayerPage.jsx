import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../Styles/PlayerPage.css';
import {
  FaHome, FaSearch, FaFolderOpen, FaPlus, FaHeart,
  FaPlay, FaPause, FaStepBackward, FaStepForward,
  FaVolumeUp, FaRegClock, FaUserCircle
} from 'react-icons/fa';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const PlayerPage = () => {
  const navigate = useNavigate();

  // === Состояния для треков ===
  const [tracks, setTracks] = useState([]); // популярные треки

  // === Состояния плеера ===
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

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

  // === Управление плеером ===
  const playTrack = useCallback((track) => {
    if (!track) return;
    if (currentTrack?.trackId === track.trackId && isPlaying) return;
    setCurrentTrack(track);
    setIsPlaying(true);
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      const audio = audioRef.current;
      audio.src = currentTrack.trackUrl?.startsWith('http')
        ? currentTrack.trackUrl
        : `http://localhost:5043${currentTrack.trackUrl}`;
      audio.load();
      audio.play().catch(e => console.error('Автовоспроизведение заблокировано:', e));
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    // здесь можно добавить автоматическое переключение на следующий трек
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleNext = () => {
    // простой следующий трек из текущего списка популярных
    if (!tracks.length) return;
    const currentIdx = tracks.findIndex(t => t.trackId === currentTrack?.trackId);
    const nextIdx = (currentIdx + 1) % tracks.length;
    playTrack(tracks[nextIdx]);
  };

  const handlePrev = () => {
    if (!tracks.length) return;
    const currentIdx = tracks.findIndex(t => t.trackId === currentTrack?.trackId);
    const prevIdx = (currentIdx - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIdx]);
  };

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
    <div className="player-page">
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Левая панель */}
      <aside className="sidebar">
        <div className="logo">KringeMusic</div>
        <nav className="nav">
          <a href="#" className="nav-item active" onClick={() => navigate('/player')}><FaHome /> Главная</a>
          <a href="#" className="nav-item" onClick={() => navigate('/search')}><FaSearch /> Поиск</a>
          <a href="#" className="nav-item"><FaFolderOpen /> Библиотека</a>
        </nav>
        <div className="playlists-section">
          <div className="playlists-header">
            <span>Ваши плейлисты</span>
            <button className="create-btn"><FaPlus /></button>
          </div>
          <ul className="playlists-list">
            <li>🎸 Рок классика</li>
            <li>💃 Танцевальные хиты</li>
            <li>🌧️ Меланхолия</li>
            <li>🏋️ Спорт</li>
          </ul>
        </div>
        <div className="liked-songs">
          <FaHeart color="#1ed760" /> Любимые треки
        </div>
      </aside>

      {/* Основной контент */}
      <main className="main-content">
        <header className="top-bar">
  <div className="greeting">Добрый вечер, Александр!</div>
  <div className="search-container" onClick={() => navigate('/search')} style={{ cursor: 'pointer' }}>
    <FaSearch className="search-icon" />
    <input
      type="text"
      placeholder="Поиск треков и исполнителей..."
      className="search-input"
      readOnly
      onFocus={() => navigate('/search')}
    />
  </div>
  <div className="user-menu">
    <FaUserCircle size={28} />
  </div>
</header>

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
      </main>

      {/* Нижний плеер */}
      {currentTrack && (
        <footer className="player-bar">
          <div className="now-playing">
            <img
              src={currentTrack.coverUrl ? `http://localhost:5043${currentTrack.coverUrl}` : 'https://via.placeholder.com/56'}
              alt="cover"
              className="current-cover"
            />
            <div className="track-info">
              <div className="current-title">{currentTrack.name}</div>
              <div className="current-artist">
                {currentTrack.artists?.map((a, idx) => (
                  <span
                    key={a.artistId}
                    onClick={(e) => { e.stopPropagation(); navigate(`/artist/${a.artistId}`); }}
                    style={{ cursor: 'pointer', textDecoration: 'underline', marginRight: '4px' }}
                  >
                    {a.name}{idx < currentTrack.artists.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            </div>
            <button className="like-btn"><FaHeart /></button>
          </div>

          <div className="player-controls">
            <button className="ctrl-btn" onClick={handlePrev}><FaStepBackward /></button>
            <button className="play-pause" onClick={handlePlayPause}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button className="ctrl-btn" onClick={handleNext}><FaStepForward /></button>
          </div>

          <div className="volume-control">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              style={{ flex: 1, margin: '0 10px' }}
            />
            <div className="time">{formatTime(currentTime)} / {formatTime(duration)}</div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PlayerPage;