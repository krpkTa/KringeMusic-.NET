import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';
import LikeButton from '../components/LikeButton';
import AlbumLikeButton from '../components/AlbumLikeButton';
import '../Styles/AlbumPage.css';

const AlbumPage = () => {
  const { artistId, albumId } = useParams();
  const navigate = useNavigate();

  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        setLoading(true);
        const data = await api.getAlbum(parseInt(artistId), parseInt(albumId));
        setAlbum(data);
        // Предполагается, что data.tracks – массив треков
        setTracks(data.tracks || []);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить альбом');
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [artistId, albumId]);

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayTrack = async (track) => {
    setCurrentTrack(track);
    try {
      await api.recordPlayHistory(track.trackId, 'album_page', 1, false);
    } catch (err) {
      console.error('Не удалось записать историю', err);
    }
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5043${url}`;
  };

  if (loading) return <Layout><div className="loading">Загрузка альбома...</div></Layout>;
  if (error || !album) return <Layout><div className="error">{error || 'Альбом не найден'}</div></Layout>;

  const coverUrl = getImageUrl(album.coverUrl);
  const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : '—';

  return (
    <Layout currentTrack={currentTrack} playerTracks={tracks}>
      <div className="album-page">
        <div className="album-header">
          <div className="album-cover">
            {coverUrl ? (
              <img src={coverUrl} alt={album.name} />
            ) : (
              <div className="placeholder-cover">🎵</div>
            )}
          </div>
          <div className="album-info">
            <span className="album-type">Альбом</span>
            <h1>{album.name}</h1>
            <div className="album-meta">
              <span className="artist-name" onClick={() => navigate(`/artist/${album.artistId}`)}>
                {album.artistName}
              </span>
              <span>• {releaseYear}</span>
              <span>• {tracks.length} треков</span>
            </div>
            <div className="album-actions">
              <button className="play-all-btn" onClick={handlePlayAll}>
                ▶ Слушать
              </button>
              <AlbumLikeButton
                artistId={album.artistId}
                albumId={album.albumId}
                size={24}
                className="album-like-btn"
              />
            </div>
          </div>
        </div>

        <div className="tracks-section">
          <div className="tracks-header">
            <span>#</span>
            <span>Название</span>
            <span>Длительность</span>
            <span></span>
          </div>
          <div className="tracks-list">
            {tracks.map((track, idx) => (
              <div
                key={track.trackId}
                className="track-row"
                onClick={() => handlePlayTrack(track)}
              >
                <span className="track-number">{idx + 1}</span>
                <div className="track-info">
                  {track.coverUrl && (
                    <img
                      src={getImageUrl(track.coverUrl)}
                      alt=""
                      className="track-cover"
                    />
                  )}
                  <div>
                    <div className="track-name">{track.name}</div>
                  </div>
                </div>
                <span className="track-duration">
                  {formatDuration(track.duration)}
                </span>
                <LikeButton trackId={track.trackId} size={18} className="track-like" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AlbumPage;