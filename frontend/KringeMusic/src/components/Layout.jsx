import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHome, FaSearch, FaFolderOpen, FaPlus, FaHeart,
  FaPlay, FaPause, FaStepBackward, FaStepForward,
  FaVolumeUp, FaUserCircle, FaHistory}
from 'react-icons/fa';
import '../Styles/Layout.css';
import { api } from '../services/api';

const Layout = ({ children, currentTrack, onTrackPlay, playerTracks = [] }) => {
  const navigate = useNavigate();

  // === Player State ===
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playingTrack, setPlayingTrack] = useState(currentTrack);
  const audioRef = useRef(null);

  // === Sync with parent ===
  useEffect(() => {
    if (currentTrack && currentTrack.trackId !== playingTrack?.trackId) {
      setPlayingTrack(currentTrack);
    }
  }, [currentTrack]);

  // === Load and play track ===
  useEffect(() => {
    if (playingTrack && audioRef.current) {
      const audio = audioRef.current;
      const url = playingTrack.trackUrl?.startsWith('http')
        ? playingTrack.trackUrl
        : `http://localhost:5043${playingTrack.trackUrl}`;
      
      audio.src = url;
      audio.load();
      audio.play().catch(e => console.error('Autoplay blocked:', e));
      setIsPlaying(true);
    }
  }, [playingTrack]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = async () => {
  if (playingTrack) {
    const fullDuration = Math.floor(duration);
    try {
      await api.recordPlayHistory(
        playingTrack.trackId,
        'player_natural_end',
        fullDuration,
        false  
      );
    } catch (err) {
      console.error('Не удалось записать окончание трека', err);
    }
  }
  setIsPlaying(false);
  setCurrentTime(0);
};

  const handlePlayPause = () => {
    if (!audioRef.current || !playingTrack) return;
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

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

const handleNext = async () => {
  if (!playerTracks.length) return;
  // Записать пропуск текущего трека
  await recordCurrentAsSkipped();

  const currentIdx = playerTracks.findIndex(t => t.trackId === playingTrack?.trackId);
  const nextIdx = (currentIdx + 1) % playerTracks.length;
  const newTrack = playerTracks[nextIdx];
  setPlayingTrack(newTrack);
  if (onTrackPlay) onTrackPlay(newTrack);
  // Для нового трека запись будет сделана при его старте (через handlePlayTrack в других местах)
};

const recordCurrentAsSkipped = async () => {
  if (!playingTrack) return;
  const playedTime = Math.floor(currentTime); // сколько секунд успел прослушать
  try {
    await api.recordPlayHistory(
      playingTrack.trackId,
      'player_skip',
      playedTime,
      true   // is_skipped = true
    );
  } catch (err) {
    console.error('Не удалось записать пропуск трека', err);
  }
};

  const handlePrev = async () => {
  if (!playerTracks.length) return;
  // Если прошло более 3 секунд – перемотать, а не переключать трек
  if (currentTime > 3) {
    if (audioRef.current) audioRef.current.currentTime = 0;
    setCurrentTime(0);
    return;
  }
  // Записать пропуск текущего трека
  await recordCurrentAsSkipped();

  const currentIdx = playerTracks.findIndex(t => t.trackId === playingTrack?.trackId);
  const prevIdx = (currentIdx - 1 + playerTracks.length) % playerTracks.length;
  const newTrack = playerTracks[prevIdx];
  setPlayingTrack(newTrack);
  if (onTrackPlay) onTrackPlay(newTrack);
};

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="layout-wrapper">
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* === SIDEBAR === */}
      <aside className="layout-sidebar">
        <div className="sidebar-logo">KringeMusic</div>
        <nav className="sidebar-nav">
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/player'); }}
          >
            <FaHome /> Главная
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/search'); }}
          >
            <FaSearch /> Поиск
          </a>
          <a href="#" className="nav-item">
            <FaFolderOpen /> Библиотека
          </a>
        </nav>
        <div className="sidebar-playlists">
          <div className="playlists-header">
            <span>Ваши плейлисты</span>
            <button className="create-btn"><FaPlus /></button>
          </div>
          <ul className="playlists-list">
            <li>🎸 Плейлист 1</li>
            <li>💃 Плейлист 2</li>
            <li>🌧️ Плейлист 3</li>
            <li>🏋️ Плейлист 4</li>
          </ul>
          <div className="liked-songs" onClick={() => navigate('/history')} style={{ cursor: 'pointer', marginTop: '20px' }}>
  <FaHistory /> История прослушиваний
</div>
        </div>
        <div 
  className="liked-songs" 
  onClick={() => navigate('/favorites')}
  style={{ cursor: 'pointer' }}
>
  <FaHeart color="#1ed760" /> Любимые треки
</div>
      </aside>

      {/* === TOP BAR === */}
      <header className="layout-topbar">
        <div className="topbar-left">
        </div>
        <div className="topbar-center">
          <div 
            className="search-container" 
            onClick={() => navigate('/search')}
            style={{ cursor: 'pointer' }}
          >
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Поиск треков и исполнителей..."
              className="search-input"
              readOnly
              onFocus={() => navigate('/search')}
            />
          </div>
        </div>
        <div className="topbar-right">
          <div className="user-menu">
            <FaUserCircle size={28} />
          </div>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <main className="layout-main-content">
        {children}
      </main>

      {/* === PLAYER BAR === */}
      <div className="layout-player-bar">
        <div className="player-now-playing">
  {playingTrack?.coverUrl && (
    <img src={`http://localhost:5043${playingTrack.coverUrl}`} alt="cover" className="player-cover" />
  )}
  <div className="player-track-info">
    <div className="player-track-title">{playingTrack?.name || 'No track'}</div>
    <div className="player-track-artist">
      {playingTrack?.artists?.map(a => a.name).join(', ') || 'Unknown'}
    </div>
  </div>
</div>

        <div className="player-controls">
          <button 
            className="player-btn"
            onClick={handlePrev}
            title="Previous track"
          >
            <FaStepBackward />
          </button>
          <button 
            className="player-btn play-btn"
            onClick={handlePlayPause}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button 
            className="player-btn"
            onClick={handleNext}
            title="Next track"
          >
            <FaStepForward />
          </button>
        </div>

        <div className="player-progress">
          <span className="time-display">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="progress-bar"
          />
          <span className="time-display">{formatTime(duration)}</span>
        </div>

        <div className="player-volume">
          <FaVolumeUp size={16} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;
