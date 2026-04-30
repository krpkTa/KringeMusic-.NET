// src/Pages/SearchPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaFolderOpen, FaPlus, FaHeart, FaUserCircle, FaRegClock } from 'react-icons/fa';
import { api } from '../services/api';
import '../Styles/SearchPage.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchArtists, setSearchArtists] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setSearchArtists([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setIsSearching(true);
    try {
      const [trackResults, artistResults] = await Promise.all([
        api.searchTracks(query),
        api.searchArtists(query)
      ]);
      setSearchResults(trackResults);
      setSearchArtists(artistResults);
    } catch (err) {
      console.error('Ошибка поиска', err);
      setSearchResults([]);
      setSearchArtists([]);
    } finally {
      setIsSearching(false);
    }
  };

  const formatDuration = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayTrack = (track) => {
    // Сохраняем трек в localStorage и перенаправляем на главную (плеер)
    localStorage.setItem('currentTrack', JSON.stringify(track));
    navigate('/player');
  };

  // Компонент строки трека
  const TrackRow = ({ track, index }) => (
    <div className="track-row" onClick={() => handlePlayTrack(track)}>
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
      <span className="track-duration">{formatDuration(track.duration)}</span>
    </div>
  );

  return (
    <div className="search-page">
      <aside className="sidebar">
        <div className="logo">KringeMusic</div>
        <nav className="nav">
          <a href="#" className="nav-item" onClick={() => navigate('/player')}><FaHome /> Главная</a>
          <a href="#" className="nav-item active"><FaSearch /> Поиск</a>
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

      <main className="search-content">
        <header className="top-bar">
          <div className="greeting">Добрый вечер, Александр!</div>
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Поиск треков и исполнителей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>
          <div className="user-menu">
            <FaUserCircle size={28} />
          </div>
        </header>

        {!searchQuery && (
          <div className="search-placeholder">
            <p>Начните вводить название трека или исполнителя...</p>
          </div>
        )}

        {searchQuery && (
          <>
            {searchArtists.length > 0 && (
              <section className="section">
                <div className="section-header">
                  <h2>Исполнители</h2>
                </div>
                <div className="cards-grid">
                  {searchArtists.map(artist => (
                    <div key={artist.artistId} className="card" onClick={() => navigate(`/artist/${artist.artistId}`)}>
                      {artist.coverUrl ? (
                        <img src={`http://localhost:5043${artist.coverUrl}`} alt={artist.name} />
                      ) : (
                        <div className="no-image">🎤</div>
                      )}
                      <h4>{artist.name}</h4>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {searchResults.length > 0 && (
              <section className="section">
                <div className="section-header">
                  <h2>Треки</h2>
                </div>
                <div className="tracks-table">
                  <div className="table-header">
                    <span>#</span><span>Название</span><span>Слушания</span><span><FaRegClock /></span>
                  </div>
                  {searchResults.map((track, idx) => (
                    <TrackRow key={track.trackId} track={track} index={idx} />
                  ))}
                </div>
              </section>
            )}

            {!isSearching && searchResults.length === 0 && searchArtists.length === 0 && (
              <div className="empty-state">Ничего не найдено</div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SearchPage;