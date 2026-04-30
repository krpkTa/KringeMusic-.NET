import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../Styles/ArtistPage.css';

const ArtistPage = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tracks'); // 'tracks' или 'albums'
  const [allTracksOpen, setAllTracksOpen] = useState(false);

  useEffect(() => {
    if (!artistId) {
      setError('ID артиста не указан');
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [artistData, artistAlbums] = await Promise.all([
          api.getArtistById(artistId),
          api.getArtistAlbums(artistId, 1, 100)
        ]);
        setArtist(artistData);
        setTracks(artistData.tracks || []);
        setAlbums(artistAlbums);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить данные артиста');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [artistId]);

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const popularTracks = [...tracks]
  .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
  .slice(0, 3);

  const handlePlayTrack = (track) => {
    localStorage.setItem('currentTrack', JSON.stringify(track));
    navigate('/player');
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      localStorage.setItem('currentTrack', JSON.stringify(tracks[0]));
      navigate('/player');
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5043${url}`;
  };

  if (loading) {
    return (
      <div className="artist-page">
        <div className="skeleton-header"></div>
        <div className="artist-content">
          <div className="skeleton-play-button"></div>
          <div className="skeleton-tabs"></div>
          <div className="skeleton-track-list"></div>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="artist-page error-container">
        <div className="error-message">{error || 'Артист не найден'}</div>
        <button className="back-button" onClick={() => navigate(-1)}>Назад</button>
      </div>
    );
  }

  const backgroundImage = getImageUrl(artist.coverUrl);

  return (
  <div className="artist-page">
    <div className="artist-main">
      {/* Верхний блок */}
      <section className="artist-top-section">
        <div className="artist-cover-block">
          {backgroundImage ? (
            <img
              src={backgroundImage}
              alt={artist.name}
              className="artist-main-cover"
            />
          ) : (
            <div className="artist-main-cover placeholder"></div>
          )}
        </div>

        <div className="artist-info-block">
          <button
            className="back-button-icon"
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          <span className="artist-label">Исполнитель</span>

          <h1 className="artist-name">{artist.name}</h1>

          {artist.description && (
            <p className="artist-description">
              {artist.description}
            </p>
          )}

          <div className="artist-meta">
            {artist.genre && <span>{artist.genre}</span>}
            <span>{tracks.length} треков</span>
            {albums.length > 0 && <span>{albums.length} альбомов</span>}
          </div>

          <div className="artist-actions">
            <button className="play-all-btn" onClick={handlePlayAll}>
              ▶ Слушать
            </button>
          </div>
        </div>
      </section>

      {/* Самые популярные */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">Самые популярные</h2>

          <button
            className="show-all-btn"
            onClick={() => setAllTracksOpen(!allTracksOpen)}
          >
            {allTracksOpen ? 'Скрыть' : 'Все песни'}
          </button>
        </div>

        <div className="tracks-list">
          {(allTracksOpen ? tracks : popularTracks).map((track, idx) => (
            <div
              key={track.trackId || idx}
              className="track-item"
              onClick={() => handlePlayTrack(track)}
            >
              <div className="track-index">{idx + 1}</div>

              <div className="track-info">
                {track.coverUrl ? (
                  <img
                    src={getImageUrl(track.coverUrl)}
                    alt=""
                    className="track-cover"
                  />
                ) : (
                  <div className="track-cover placeholder"></div>
                )}

                <div className="track-details">
                  <span className="track-name">{track.name}</span>
                  <span className="track-artist">{artist.name}</span>
                </div>
              </div>

              <div className="track-duration">
                {formatDuration(track.duration)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Альбомы */}
      {albums.length > 0 && (
        <section className="content-section">
          <h2 className="section-title">Альбомы</h2>

          <div className="albums-grid">
            {albums.map((album) => (
              <div
                key={album.albumId}
                className="album-card"
              >
                <div className="album-cover-wrapper">
                  {album.coverUrl ? (
                    <img
                      src={getImageUrl(album.coverUrl)}
                      alt={album.name}
                      className="album-cover"
                    />
                  ) : (
                    <div className="album-cover placeholder"></div>
                  )}
                </div>

                <h4 className="album-title">{album.name}</h4>

                <p className="album-year">
                  {album.releaseDate
                    ? new Date(album.releaseDate).getFullYear()
                    : '—'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  </div>
);
};

export default ArtistPage;