import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import '../Styles/OnboardingPage.css';

const OnboardingPage = () => {
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genresData, artistsData, userPrefs] = await Promise.all([
          api.getGenres(),
          api.getArtists('', 1, 100),
          api.getUserPreferences().catch(() => ({ genreIds: [], artistIds: [] }))
        ]);
        setGenres(genresData);
        setArtists(artistsData);
        setSelectedGenres(userPrefs.genreIds || []);
        setSelectedArtists(userPrefs.artistIds || []);
      } catch (err) {
        console.error('Ошибка загрузки данных для онбординга', err);
        alert('Не удалось загрузить список жанров и исполнителей. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleGenre = (genreId) => {
    setSelectedGenres(prev =>
      prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
    );
  };

  const toggleArtist = (artistId) => {
    setSelectedArtists(prev =>
      prev.includes(artistId) ? prev.filter(id => id !== artistId) : [...prev, artistId]
    );
  };

  const handleSubmit = async () => {
    if (selectedGenres.length === 0 && selectedArtists.length === 0) {
      alert('Выберите хотя бы один жанр или одного исполнителя');
      return;
    }

    setSubmitting(true);
    try {
      await api.saveUserPreferences({ genreIds: selectedGenres, artistIds: selectedArtists });
      localStorage.setItem('hasCompletedOnboarding', 'true');
      window.location.href = '/player';
    } catch (err) {
      console.error('Ошибка сохранения предпочтений', err);
      alert('Не удалось сохранить выбор. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="onboarding-loading">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <h1>Добро пожаловать! 🎉</h1>
        <p className="subtitle">
          Расскажите о своих музыкальных предпочтениях, чтобы мы могли порекомендовать вам лучшие треки.
        </p>

        <div className="selection-section">
          <h2>Ваши любимые жанры</h2>
          <div className="chips-container">
            {genres.map(genre => (
              <button
                key={genre.genreId}
                className={`chip ${selectedGenres.includes(genre.genreId) ? 'active' : ''}`}
                onClick={() => toggleGenre(genre.genreId)}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        <div className="selection-section">
          <h2>Ваши любимые исполнители</h2>
          <div className="artists-grid">
            {artists.map(artist => (
              <div
                key={artist.artistId}
                className={`artist-card ${selectedArtists.includes(artist.artistId) ? 'active' : ''}`}
                onClick={() => toggleArtist(artist.artistId)}
              >
                {artist.coverUrl ? (
                  <img src={`http://localhost:5043${artist.coverUrl}`} alt={artist.name} />
                ) : (
                  <div className="artist-placeholder">🎤</div>
                )}
                <span className="artist-name">{artist.name}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="continue-btn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Сохранение...' : 'Продолжить'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;