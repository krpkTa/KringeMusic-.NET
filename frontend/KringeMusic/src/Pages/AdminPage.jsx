// AdminPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import '../Styles/AdminPage.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('artists');
  const [artists, setArtists] = useState([]);
  const [labels, setLabels] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);

  // Форма добавления артиста
  const [artistForm, setArtistForm] = useState({
    name: '',
    description: '',
    labelId: '',
    coverFile: null,
  });

  // Форма добавления лейбла
  const [labelForm, setLabelForm] = useState({
    name: '',
    country: '',
    coverFile: null,
  });

  // Форма добавления трека (обновлённая структура)
  const [trackForm, setTrackForm] = useState({
    name: '',
    releaseDate: '',
    duration: '',
    artists: [{ artistId: '', isPrimary: false }],
    genreIds: [],
    trackFile: null,
    coverFile: null,
  });

  // Редактирование
  const [editingArtist, setEditingArtist] = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [editingTrack, setEditingTrack] = useState(null);

  // Refs для файлов
  const fileInputRef = useRef(null);
  const labelCoverInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const trackCoverInputRef = useRef(null);

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  const loadArtists = async () => {
    setLoading(true);
    try {
      const data = await api.getArtists('', 1, 100);
      setArtists(data);
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки артистов');
    } finally {
      setLoading(false);
    }
  };

  const loadLabels = async () => {
    try {
      const data = await api.getLabels('', 1, 100);
      setLabels(data);
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки лейблов');
    }
  };

  const loadTracks = async () => {
    setLoading(true);
    try {
      const data = await api.getTracks('', 1, 100);
      setTracks(data);
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки треков');
    } finally {
      setLoading(false);
    }
  };

  const loadGenres = async () => {
    try {
      const data = await api.getGenres();
      setGenres(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'artists') loadArtists();
    if (activeTab === 'labels') loadLabels();
    if (activeTab === 'tracks') loadTracks();
  }, [activeTab]);

  useEffect(() => {
    loadLabels();
    loadArtists();
    loadGenres(); // загружаем жанры для селекта
  }, []);

  // ========== АРТИСТЫ ==========
  const handleArtistSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('Name', artistForm.name);
    fd.append('Description', artistForm.description);
    if (artistForm.labelId) fd.append('LabelId', artistForm.labelId);
    if (artistForm.coverFile) fd.append('CoverFile', artistForm.coverFile);

    try {
      await api.createArtist(fd);
      alert('Артист создан');
      setArtistForm({ name: '', description: '', labelId: '', coverFile: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadArtists();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleDeleteArtist = async (id) => {
    if (window.confirm('Удалить артиста?')) {
      try {
        await api.deleteArtist(id);
        loadArtists();
      } catch (err) {
        alert('Ошибка удаления');
      }
    }
  };

  const handleUpdateArtist = async (id, updatedData) => {
    const fd = new FormData();
    fd.append('Name', updatedData.name);
    fd.append('Description', updatedData.description);
    if (updatedData.labelId) fd.append('LabelId', updatedData.labelId);
    if (updatedData.coverFile) fd.append('CoverFile', updatedData.coverFile);

    try {
      await api.updateArtist(id, fd);
      alert('Артист обновлён');
      setEditingArtist(null);
      loadArtists();
    } catch (err) {
      alert('Ошибка обновления: ' + err.message);
    }
  };

  // ========== ЛЕЙБЛЫ ==========
  const handleLabelSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('Name', labelForm.name);
    fd.append('Country', labelForm.country);
    if (labelForm.coverFile) fd.append('LogoFile', labelForm.coverFile);

    try {
      await api.createLabel(fd);
      alert('Лейбл создан');
      setLabelForm({ name: '', country: '', coverFile: null });
      if (labelCoverInputRef.current) labelCoverInputRef.current.value = '';
      loadLabels();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleDeleteLabel = async (id) => {
    if (window.confirm('Удалить лейбл? Все связанные артисты останутся без лейбла.')) {
      try {
        await api.deleteLabel(id);
        loadLabels();
      } catch (err) {
        alert('Ошибка удаления: ' + err.message);
      }
    }
  };

  const handleUpdateLabel = async (id, { name, country, coverFile }) => {
    const fd = new FormData();
    fd.append('Name', name);
    fd.append('Country', country);
    if (coverFile) fd.append('LogoFile', coverFile);

    try {
      await api.updateLabel(id, fd);
      alert('Лейбл обновлён');
      setEditingLabel(null);
      loadLabels();
    } catch (err) {
      alert('Ошибка обновления: ' + err.message);
    }
  };

  // ========== ТРЕКИ ==========
  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('Name', trackForm.name);
    fd.append('Duration', trackForm.duration);
    fd.append('ReleaseDate', trackForm.releaseDate);
    fd.append('TrackFile', trackForm.trackFile);
    if (trackForm.coverFile) fd.append('CoverFile', trackForm.coverFile);
    fd.append('ArtistsJson', artistsJson);
    fd.append('GenreIdsJson', genreIdsJson);

    const artistsJson = JSON.stringify(trackForm.artists.map(a => ({
      artistId: Number(a.artistId),
      isPrimary: a.isPrimary
    })));
    fd.append('artistsJson', artistsJson);

    const genreIdsJson = JSON.stringify(trackForm.genreIds);
    fd.append('genreIdsJson', genreIdsJson);

    try {
      await api.createTrack(fd);
      alert('Трек создан');
      setTrackForm({
        name: '',
        releaseDate: '',
        duration: '',
        artists: [{ artistId: '', isPrimary: false }],
        genreIds: [],
        trackFile: null,
        coverFile: null,
      });
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (trackCoverInputRef.current) trackCoverInputRef.current.value = '';
      loadTracks();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleDeleteTrack = async (id) => {
    if (window.confirm('Удалить трек?')) {
      try {
        await api.deleteTrack(id);
        loadTracks();
      } catch (err) {
        alert('Ошибка удаления');
      }
    }
  };

  const handleUpdateTrack = async (id, updatedData) => {
    const fd = new FormData();
    fd.append('name', updatedData.name);
    fd.append('duration', updatedData.duration);
    fd.append('releaseDate', updatedData.releaseDate);
    if (updatedData.trackFile) fd.append('trackFile', updatedData.trackFile);
    if (updatedData.coverFile) fd.append('coverFile', updatedData.coverFile);

    const artistsJson = JSON.stringify(updatedData.artists.map(a => ({
      artistId: Number(a.artistId),
      isPrimary: a.isPrimary
    })));
    fd.append('artistsJson', artistsJson);

    const genreIdsJson = JSON.stringify(updatedData.genreIds);
    fd.append('genreIdsJson', genreIdsJson);

    try {
      await api.updateTrack(id, fd);
      alert('Трек обновлён');
      setEditingTrack(null);
      loadTracks();
    } catch (err) {
      alert('Ошибка обновления: ' + err.message);
    }
  };

  // ========== ВСПОМОГАТЕЛЬНЫЕ ==========
  const getLabelName = (labelId) => {
    const label = labels.find(l => l.labelId === labelId);
    return label ? label.name : '—';
  };

  // ========== ОТРИСОВКА ==========
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Панель управления</h1>
        <div className="tabs">
          <button className={activeTab === 'artists' ? 'active' : ''} onClick={() => setActiveTab('artists')}>
            Артисты
          </button>
          <button className={activeTab === 'labels' ? 'active' : ''} onClick={() => setActiveTab('labels')}>
            Лейблы
          </button>
          <button className={activeTab === 'tracks' ? 'active' : ''} onClick={() => setActiveTab('tracks')}>
            Треки
          </button>
        </div>
      </div>

      {/* ---------- АРТИСТЫ ---------- */}
      {activeTab === 'artists' && (
        <div className="section">
          <div className="form-card admin-form">
            <h3>➕ Добавить артиста</h3>
            <form onSubmit={handleArtistSubmit}>
              <div className="input-group">
                <label>Имя артиста</label>
                <input
                  type="text"
                  value={artistForm.name}
                  onChange={e => setArtistForm({ ...artistForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Фото / обложка</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={e => setArtistForm({ ...artistForm, coverFile: e.target.files[0] })}
                />
              </div>
              <div className="input-group">
                <label>Описание</label>
                <textarea
                  rows="3"
                  value={artistForm.description}
                  onChange={e => setArtistForm({ ...artistForm, description: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Лейбл</label>
                <select
                  value={artistForm.labelId}
                  onChange={e => setArtistForm({ ...artistForm, labelId: e.target.value })}
                >
                  <option value="">Без лейбла</option>
                  {labels.map(label => (
                    <option key={label.labelId} value={label.labelId}>{label.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit">Создать артиста</button>
            </form>
          </div>

          <div className="items-grid">
            <h3>📋 Существующие артисты</h3>
            {loading && <p>Загрузка...</p>}
            <div className="grid">
              {artists.map(artist => (
                <div className="item-card" key={artist.artistId}>
                  {editingArtist === artist.artistId ? (
                    <div className="edit-form">
                      <input type="text" defaultValue={artist.name} placeholder="Имя" />
                      <textarea defaultValue={artist.description} placeholder="Описание" />
                      <select defaultValue={artist.labelId || ''}>
                        <option value="">Без лейбла</option>
                        {labels.map(l => (
                          <option key={l.labelId} value={l.labelId}>{l.name}</option>
                        ))}
                      </select>
                      <input type="file" accept="image/*" />
                      <button onClick={() => {
                        const nameInput = document.querySelector('.edit-form input[placeholder="Имя"]').value;
                        const descInput = document.querySelector('.edit-form textarea').value;
                        const selectInput = document.querySelector('.edit-form select').value;
                        const fileInput = document.querySelector('.edit-form input[type="file"]').files[0];
                        handleUpdateArtist(artist.artistId, {
                          name: nameInput,
                          description: descInput,
                          labelId: selectInput || null,
                          coverFile: fileInput,
                        });
                      }}>💾 Сохранить</button>
                      <button onClick={() => setEditingArtist(null)}>❌ Отмена</button>
                    </div>
                  ) : (
                    <>
                      <div className="item-icon">
                        {artist.coverUrl ? (
                          <img src={`http://localhost:5043${artist.coverUrl}`} width="50" alt="cover" />
                        ) : '🎤'}
                      </div>
                      <div className="item-info">
                        <h4>{artist.name}</h4>
                        {artist.description && <p>{artist.description.substring(0, 60)}...</p>}
                        <p>Лейбл: {getLabelName(artist.labelId)}</p>
                        <p>Треков: {artist.tracksCount || 0}</p>
                      </div>
                      <div className="card-actions">
                        <button className="edit-btn" onClick={() => setEditingArtist(artist.artistId)}>✏️</button>
                        <button className="delete-btn" onClick={() => handleDeleteArtist(artist.artistId)}>🗑️</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- ЛЕЙБЛЫ ---------- */}
      {activeTab === 'labels' && (
        <div className="section">
          <div className="form-card admin-form">
            <h3>➕ Добавить лейбл</h3>
            <form onSubmit={handleLabelSubmit}>
              <div className="input-group">
                <label>Название лейбла</label>
                <input
                  type="text"
                  value={labelForm.name}
                  onChange={e => setLabelForm({ ...labelForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Страна</label>
                <input
                  type="text"
                  value={labelForm.country}
                  onChange={e => setLabelForm({ ...labelForm, country: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Логотип / обложка</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={labelCoverInputRef}
                  onChange={e => setLabelForm({ ...labelForm, coverFile: e.target.files[0] })}
                />
              </div>
              <button type="submit">Создать лейбл</button>
            </form>
          </div>

          <div className="items-grid">
            <h3>📋 Существующие лейблы</h3>
            <div className="grid">
              {labels.map(label => (
                <div className="item-card" key={label.labelId}>
                  {editingLabel === label.labelId ? (
                    <div className="edit-form">
                      <input type="text" defaultValue={label.name} placeholder="Название" />
                      <input type="text" defaultValue={label.country} placeholder="Страна" />
                      <input type="file" accept="image/*" />
                      <button onClick={() => {
                        const newName = document.querySelector('.edit-form input[placeholder="Название"]').value;
                        const newCountry = document.querySelector('.edit-form input[placeholder="Страна"]').value;
                        const coverFile = document.querySelector('.edit-form input[type="file"]').files[0];
                        handleUpdateLabel(label.labelId, { name: newName, country: newCountry, coverFile });
                      }}>💾 Сохранить</button>
                      <button onClick={() => setEditingLabel(null)}>❌ Отмена</button>
                    </div>
                  ) : (
                    <>
                      <div className="item-icon">
                        {label.logoUrl ? (
                          <img src={`http://localhost:5043${label.logoUrl}`} width="60" height="60" style={{ objectFit: 'cover', borderRadius: '8px' }} alt={label.name} />
                        ) : (
                          <span style={{ fontSize: '2rem' }}>🏷️</span>
                        )}
                      </div>
                      <div className="item-info">
                        <h4>{label.name}</h4>
                        {label.country && <p>Страна: {label.country}</p>}
                        <p>Артистов: {label.artistsCount || 0}</p>
                      </div>
                      <div className="card-actions">
                        <button className="edit-btn" onClick={() => setEditingLabel(label.labelId)}>✏️</button>
                        <button className="delete-btn" onClick={() => handleDeleteLabel(label.labelId)}>🗑️</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- ТРЕКИ (новая версия) ---------- */}
      {activeTab === 'tracks' && (
        <div className="section">
          <div className="form-card admin-form">
            <h3>➕ Добавить трек</h3>
            <form onSubmit={handleTrackSubmit}>
              <div className="input-group">
                <label>Название трека</label>
                <input
                  type="text"
                  value={trackForm.name}
                  onChange={e => setTrackForm({ ...trackForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Дата релиза</label>
                <input
                  type="date"
                  value={trackForm.releaseDate}
                  onChange={e => setTrackForm({ ...trackForm, releaseDate: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Длительность (секунды)</label>
                <input
                  type="number"
                  value={trackForm.duration}
                  onChange={e => setTrackForm({ ...trackForm, duration: e.target.value })}
                  required
                />
              </div>

              {/* Исполнители (можно добавить несколько) */}
              <div className="input-group">
                <label>Исполнители</label>
                {trackForm.artists.map((artist, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <select
                      value={artist.artistId}
                      onChange={e => {
                        const newArtists = [...trackForm.artists];
                        newArtists[idx].artistId = Number(e.target.value);
                        setTrackForm({ ...trackForm, artists: newArtists });
                      }}
                    >
                      <option value="">Выберите артиста</option>
                      {artists.map(a => (
                        <option key={a.artistId} value={a.artistId}>{a.name}</option>
                      ))}
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="checkbox"
                        checked={artist.isPrimary}
                        onChange={e => {
                          const newArtists = [...trackForm.artists];
                          if (e.target.checked) {
                            newArtists.forEach(a => a.isPrimary = false);
                            newArtists[idx].isPrimary = true;
                          } else {
                            newArtists[idx].isPrimary = false;
                          }
                          setTrackForm({ ...trackForm, artists: newArtists });
                        }}
                      />
                      Основной
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newArtists = trackForm.artists.filter((_, i) => i !== idx);
                        setTrackForm({ ...trackForm, artists: newArtists });
                      }}
                    >🗑️</button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setTrackForm({
                    ...trackForm,
                    artists: [...trackForm.artists, { artistId: '', isPrimary: false }]
                  })}
                >+ Добавить исполнителя</button>
              </div>

              {/* Жанры (мультивыбор) */}
              <div className="input-group">
                <label>Жанры</label>
                <select
                  multiple
                  value={trackForm.genreIds}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value));
                    setTrackForm({ ...trackForm, genreIds: selected });
                  }}
                  style={{ height: '100px' }}
                >
                  {genres.map(genre => (
                    <option key={genre.genreId} value={genre.genreId}>{genre.name}</option>
                  ))}
                </select>
                <small>Зажмите Ctrl (Cmd) для выбора нескольких</small>
              </div>

              <div className="input-group">
                <label>Аудиофайл (mp3)</label>
                <input
                  type="file"
                  accept="audio/*"
                  ref={audioInputRef}
                  onChange={e => setTrackForm({ ...trackForm, trackFile: e.target.files[0] })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Обложка трека (опционально)</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={trackCoverInputRef}
                  onChange={e => setTrackForm({ ...trackForm, coverFile: e.target.files[0] })}
                />
              </div>
              <button type="submit">Создать трек</button>
            </form>
          </div>

          <div className="items-grid">
            <h3>🎵 Существующие треки</h3>
            {loading && <p>Загрузка...</p>}
            <div className="grid">
              {tracks.map(track => (
                <div className="item-card" key={track.trackId}>
                  {editingTrack === track.trackId ? (
                    <div className="edit-form">
                      <input type="text" defaultValue={track.name} placeholder="Название" />
                      <input type="date" defaultValue={track.releaseDate?.split('T')[0]} />
                      <input type="number" defaultValue={track.duration} placeholder="Длительность" />
                      <input type="file" accept="audio/*" />
                      <input type="file" accept="image/*" />
                      <button onClick={() => {
                        const name = document.querySelector('.edit-form input[placeholder="Название"]').value;
                        const releaseDate = document.querySelector('.edit-form input[type="date"]').value;
                        const duration = document.querySelector('.edit-form input[placeholder="Длительность"]').value;
                        const trackFile = document.querySelectorAll('.edit-form input[type="file"]')[0].files[0];
                        const coverFile = document.querySelectorAll('.edit-form input[type="file"]')[1].files[0];
                        // В реальном проекте нужно также дать возможность изменить исполнителей и жанры
                        handleUpdateTrack(track.trackId, {
                          name, releaseDate, duration, trackFile, coverFile,
                          artists: track.artists,     // пока сохраняем старых
                          genreIds: track.genres?.map(g => g.genreId) || []
                        });
                      }}>💾 Сохранить</button>
                      <button onClick={() => setEditingTrack(null)}>❌ Отмена</button>
                    </div>
                  ) : (
                    <>
                      <div className="item-icon">
                        {track.coverUrl ? (
                          <img src={`http://localhost:5043${track.coverUrl}`} width="50" alt="cover" />
                        ) : '🎵'}
                      </div>
                      <div className="item-info">
                        <h4>{track.name}</h4>
                        <p>
                          Исполнители:{' '}
                          {track.artists?.map((a, idx) => (
                            <span key={a.artistId}>
                              {a.name}{a.isPrimary && ' (осн.)'}
                              {idx < track.artists.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </p>
                        <p>Жанры: {track.genres?.join(', ')}</p>
                        <p>Дата: {new Date(track.releaseDate).toLocaleDateString()}</p>
                        <p>Длительность: {Math.floor(track.duration / 60)}:{track.duration % 60}</p>
                      </div>
                      <div className="card-actions">
                        <button className="edit-btn" onClick={() => setEditingTrack(track.trackId)}>✏️</button>
                        <button className="delete-btn" onClick={() => handleDeleteTrack(track.trackId)}>🗑️</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;