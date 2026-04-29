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
    genreIds: [],
  });

  // Данные для редактирования артиста
  const [editingArtistData, setEditingArtistData] = useState({
    name: '',
    description: '',
    labelId: '',
    coverUrl: null,
    coverFile: null,
    genreIds: [],
  });

  // Форма добавления лейбла
  const [labelForm, setLabelForm] = useState({
    name: '',
    country: '',
    coverFile: null,
  });

  // Данные для редактирования лейбла
  const [editingLabelData, setEditingLabelData] = useState({
    name: '',
    country: '',
    logoUrl: null,
    logoFile: null,
  });

  // Форма добавления трека
  const [trackForm, setTrackForm] = useState({
    name: '',
    releaseDate: '',
    duration: '',
    artists: [{ artistId: '', isPrimary: false }],
    genreIds: [],
    trackFile: null,
    coverFile: null,
  });

  // Данные для редактирования трека
  const [editingTrackData, setEditingTrackData] = useState({
    name: '',
    duration: '',
    releaseDate: '',
    artists: [],
    genreIds: [],
    trackUrl: null,
    coverUrl: null,
    trackFile: null,
    coverFile: null,
  });

  // Редактирование (id редактируемого объекта)
  const [editingArtist, setEditingArtist] = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [editingTrack, setEditingTrack] = useState(null);

  // Состояния загрузки для кнопок
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);

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
    loadGenres();
  }, []);

  // ========== АРТИСТЫ ==========
  const handleArtistSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append('Name', artistForm.name);
    fd.append('Description', artistForm.description);
    if (artistForm.labelId) fd.append('LabelId', artistForm.labelId);
    if (artistForm.coverFile) fd.append('CoverFile', artistForm.coverFile);
    artistForm.genreIds.forEach((id, idx) => {
      fd.append(`GenreIds[${idx}]`, id);
    });

    try {
      await api.createArtist(fd);
      alert('Артист создан');
      setArtistForm({ name: '', description: '', labelId: '', coverFile: null, genreIds: [] });
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadArtists();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      setSubmitting(false);
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

  const startEditArtist = async (artistId) => {
    try {
      const artist = await api.getArtistById(artistId);
      setEditingArtistData({
        name: artist.name,
        description: artist.description || '',
        labelId: artist.labelId || '',
        coverUrl: artist.coverUrl,
        coverFile: null,
        genreIds: artist.genres?.map(g => g.genreId) || [],
      });
      setEditingArtist(artistId);
    } catch (err) {
      alert('Ошибка загрузки данных артиста: ' + err.message);
    }
  };

  const handleUpdateArtistSubmit = async () => {
    setUpdating(true);
    const fd = new FormData();
    fd.append('Name', editingArtistData.name);
    fd.append('Description', editingArtistData.description);
    if (editingArtistData.labelId) fd.append('LabelId', editingArtistData.labelId);
    if (editingArtistData.coverFile) fd.append('CoverFile', editingArtistData.coverFile);
    editingArtistData.genreIds.forEach((id, idx) => {
      fd.append(`GenreIds[${idx}]`, id);
    });

    try {
      await api.updateArtist(editingArtist, fd);
      alert('Артист обновлён');
      setEditingArtist(null);
      loadArtists();
    } catch (err) {
      alert('Ошибка обновления: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // ========== ЛЕЙБЛЫ ==========
  const handleLabelSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
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

  const startEditLabel = async (labelId) => {
    try {
      const label = await api.getLabelById(labelId);
      setEditingLabelData({
        name: label.name,
        country: label.country || '',
        logoUrl: label.logoUrl,
        logoFile: null,
      });
      setEditingLabel(labelId);
    } catch (err) {
      alert('Ошибка загрузки данных лейбла: ' + err.message);
    }
  };

  const handleUpdateLabelSubmit = async () => {
    setUpdating(true);
    const fd = new FormData();
    fd.append('Name', editingLabelData.name);
    fd.append('Country', editingLabelData.country);
    if (editingLabelData.logoFile) fd.append('LogoFile', editingLabelData.logoFile);

    try {
      await api.updateLabel(editingLabel, fd);
      alert('Лейбл обновлён');
      setEditingLabel(null);
      loadLabels();
    } catch (err) {
      alert('Ошибка обновления: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const toUTCISOString = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString();
  };

  // ========== ТРЕКИ ==========
  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append('Name', trackForm.name);
    fd.append('Duration', trackForm.duration);
    fd.append('ReleaseDate', toUTCISOString(trackForm.releaseDate));
    fd.append('TrackFile', trackForm.trackFile);
    if (trackForm.coverFile) fd.append('CoverFile', trackForm.coverFile);
    const artistsJson = JSON.stringify(trackForm.artists.map(a => ({
      artistId: Number(a.artistId),
      isPrimary: a.isPrimary
    })));
    fd.append('artistsJson', artistsJson);
    fd.append('genreIdsJson', JSON.stringify(trackForm.genreIds.map(id => Number(id))));

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
    } finally {
      setSubmitting(false);
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

  const startEditTrack = async (trackId) => {
    try {
      const track = await api.getTrackById(trackId);
      let genreIds = [];
      if (track.genres && Array.isArray(track.genres)) {
        if (track.genres.length > 0 && typeof track.genres[0] === 'object') {
          genreIds = track.genres.map(g => Number(g.genreId));
        } else {
          genreIds = track.genres.map(genreName => {
            const found = genres.find(g => g.name === genreName);
            return found ? found.genreId : null;
          }).filter(id => id !== null);
        }
      }
      setEditingTrackData({
        name: track.name,
        duration: track.duration,
        releaseDate: track.releaseDate?.split('T')[0] || '',
        artists: track.artists?.map(a => ({
          artistId: Number(a.artistId),
          isPrimary: a.isPrimary
        })) || [],
        genreIds: genreIds,
        trackUrl: track.trackUrl,
        coverUrl: track.coverUrl,
        trackFile: null,
        coverFile: null,
      });
      setEditingTrack(trackId);
    } catch (err) {
      alert('Ошибка загрузки данных трека: ' + err.message);
    }
  };

  const handleUpdateTrackSubmit = async () => {
    setUpdating(true);
    const fd = new FormData();
    fd.append('Name', editingTrackData.name);
    fd.append('Duration', editingTrackData.duration);
    fd.append('ReleaseDate', toUTCISOString(editingTrackData.releaseDate));
    if (editingTrackData.trackFile) fd.append('TrackFile', editingTrackData.trackFile);
    if (editingTrackData.coverFile) fd.append('CoverFile', editingTrackData.coverFile);
    const artistsArray = editingTrackData.artists.map(a => ({
      artistId: Number(a.artistId),
      isPrimary: a.isPrimary
    }));
    fd.append('artistsJson', JSON.stringify(artistsArray));
    const genreIdsArray = editingTrackData.genreIds.map(id => Number(id)).filter(id => !isNaN(id));
    fd.append('genreIdsJson', JSON.stringify(genreIdsArray));

    try {
      await api.updateTrack(editingTrack, fd);
      alert('Трек обновлён');
      setEditingTrack(null);
      loadTracks();
    } catch (err) {
      alert('Ошибка обновления: ' + err.message);
    } finally {
      setUpdating(false);
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
      <div className="admin-container">
        <div className="admin-header">
          <h1>🎵 Панель управления</h1>
        </div>
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'artists' ? 'active' : ''}`} onClick={() => setActiveTab('artists')}>
            🎤 Артисты
          </button>
          <button className={`tab-btn ${activeTab === 'labels' ? 'active' : ''}`} onClick={() => setActiveTab('labels')}>
            🏷️ Лейблы
          </button>
          <button className={`tab-btn ${activeTab === 'tracks' ? 'active' : ''}`} onClick={() => setActiveTab('tracks')}>
            🎧 Треки
          </button>
        </div>

        {/* ---------- АРТИСТЫ ---------- */}
        {activeTab === 'artists' && (
          <div className="section">
            <div className="form-card admin-form">
              <h3>➕ Добавить артиста</h3>
              <form onSubmit={handleArtistSubmit}>
                <div className="input-group">
                  <label>Имя артиста <span className="required">*</span></label>
                  <input
                    type="text"
                    value={artistForm.name}
                    onChange={e => setArtistForm({ ...artistForm, name: e.target.value })}
                    placeholder="Например: The Weeknd"
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
                  <small>Рекомендуемый размер: 500x500 px</small>
                </div>
                <div className="input-group">
                  <label>Описание</label>
                  <textarea
                    rows="3"
                    value={artistForm.description}
                    onChange={e => setArtistForm({ ...artistForm, description: e.target.value })}
                    placeholder="Краткая биография, стиль, достижения..."
                  />
                </div>
                <div className="input-group">
                  <label>Жанры (можно выбрать несколько)</label>
                  <select
                    multiple
                    value={artistForm.genreIds}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value));
                      setArtistForm({ ...artistForm, genreIds: selected });
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
                  <label>Лейбл</label>
                  <select
                    value={artistForm.labelId}
                    onChange={e => setArtistForm({ ...artistForm, labelId: e.target.value })}
                  >
                    <option value="">— Без лейбла —</option>
                    {labels.map(label => (
                      <option key={label.labelId} value={label.labelId}>{label.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={submitting || !artistForm.name}>
                  {submitting ? 'Создание...' : '✨ Создать артиста'}
                </button>
              </form>
            </div>

            <div className="items-grid">
              <h3>📋 Существующие артисты</h3>
              {loading && <div className="loading-spinner">Загрузка...</div>}
              {!loading && artists.length === 0 && <div className="empty-state">😕 Артисты не найдены</div>}
              <div className="grid">
                {artists.map(artist => (
                  <div className="item-card" key={artist.artistId}>
                    {editingArtist === artist.artistId ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editingArtistData.name}
                          onChange={e => setEditingArtistData({ ...editingArtistData, name: e.target.value })}
                          placeholder="Имя"
                        />
                        <textarea
                          value={editingArtistData.description}
                          onChange={e => setEditingArtistData({ ...editingArtistData, description: e.target.value })}
                          placeholder="Описание"
                        />
                        <select
                          value={editingArtistData.labelId}
                          onChange={e => setEditingArtistData({ ...editingArtistData, labelId: e.target.value })}
                        >
                          <option value="">— Без лейбла —</option>
                          {labels.map(l => (
                            <option key={l.labelId} value={l.labelId}>{l.name}</option>
                          ))}
                        </select>
                        {editingArtistData.coverUrl && (
                          <div className="edit-cover">
                            <label>Текущая обложка:</label>
                            <img src={`http://localhost:5043${editingArtistData.coverUrl}`} width="80" alt="current" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => setEditingArtistData({ ...editingArtistData, coverFile: e.target.files[0] })}
                        />
                        <select
                          multiple
                          value={editingArtistData.genreIds}
                          onChange={e => {
                            const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value));
                            setEditingArtistData({ ...editingArtistData, genreIds: selected });
                          }}
                          style={{ height: '80px' }}
                        >
                          {genres.map(g => (
                            <option key={g.genreId} value={g.genreId}>{g.name}</option>
                          ))}
                        </select>
                        <div className="edit-actions">
                          <button onClick={handleUpdateArtistSubmit} disabled={updating}>
                            {updating ? 'Сохранение...' : '💾 Сохранить'}
                          </button>
                          <button onClick={() => setEditingArtist(null)}>❌ Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="item-icon">
                          {artist.coverUrl ? (
                            <img src={`http://localhost:5043${artist.coverUrl}`} alt="cover" />
                          ) : (
                            <span className="no-image">🎤</span>
                          )}
                        </div>
                        <div className="item-info">
                          <h4>{artist.name}</h4>
                          {artist.description && <p>{artist.description.substring(0, 60)}...</p>}
                          <p>Лейбл: {artist.labelName || '—'}</p>
                          <p>Жанры: {artist.genres?.join(', ') || '—'}</p>
                          <p>Треков: {artist.tracksCount || 0}</p>
                        </div>
                        <div className="card-actions">
                          <button className="edit-btn" onClick={() => startEditArtist(artist.artistId)} title="Редактировать">✏️</button>
                          <button className="delete-btn" onClick={() => handleDeleteArtist(artist.artistId)} title="Удалить">🗑️</button>
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
                  <label>Название лейбла <span className="required">*</span></label>
                  <input
                    type="text"
                    value={labelForm.name}
                    onChange={e => setLabelForm({ ...labelForm, name: e.target.value })}
                    placeholder="Например: Universal Music"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Страна</label>
                  <input
                    type="text"
                    value={labelForm.country}
                    onChange={e => setLabelForm({ ...labelForm, country: e.target.value })}
                    placeholder="Страна базирования"
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
                  <small>Квадратное изображение, предпочтительно PNG</small>
                </div>
                <button type="submit" disabled={submitting || !labelForm.name}>
                  {submitting ? 'Создание...' : '🏷️ Создать лейбл'}
                </button>
              </form>
            </div>

            <div className="items-grid">
              <h3>📋 Существующие лейблы</h3>
              {labels.length === 0 && !loading && <div className="empty-state">📭 Лейблы не найдены</div>}
              <div className="grid">
                {labels.map(label => (
                  <div className="item-card" key={label.labelId}>
                    {editingLabel === label.labelId ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editingLabelData.name}
                          onChange={e => setEditingLabelData({ ...editingLabelData, name: e.target.value })}
                          placeholder="Название"
                        />
                        <input
                          type="text"
                          value={editingLabelData.country}
                          onChange={e => setEditingLabelData({ ...editingLabelData, country: e.target.value })}
                          placeholder="Страна"
                        />
                        {editingLabelData.logoUrl && (
                          <div className="edit-cover">
                            <label>Текущий логотип:</label>
                            <img src={`http://localhost:5043${editingLabelData.logoUrl}`} width="60" height="60" alt="logo" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => setEditingLabelData({ ...editingLabelData, logoFile: e.target.files[0] })}
                        />
                        <div className="edit-actions">
                          <button onClick={handleUpdateLabelSubmit} disabled={updating}>
                            {updating ? 'Сохранение...' : '💾 Сохранить'}
                          </button>
                          <button onClick={() => setEditingLabel(null)}>❌ Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="item-icon">
                          {label.logoUrl ? (
                            <img src={`http://localhost:5043${label.logoUrl}`} alt={label.name} />
                          ) : (
                            <span className="no-image">🏷️</span>
                          )}
                        </div>
                        <div className="item-info">
                          <h4>{label.name}</h4>
                          {label.country && <p>🌍 Страна: {label.country}</p>}
                          <p>🎤 Артистов: {label.artistsCount || 0}</p>
                        </div>
                        <div className="card-actions">
                          <button className="edit-btn" onClick={() => startEditLabel(label.labelId)} title="Редактировать">✏️</button>
                          <button className="delete-btn" onClick={() => handleDeleteLabel(label.labelId)} title="Удалить">🗑️</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------- ТРЕКИ ---------- */}
        {activeTab === 'tracks' && (
          <div className="section">
            <div className="form-card admin-form">
              <h3>➕ Добавить трек</h3>
              <form onSubmit={handleTrackSubmit}>
                <div className="input-group">
                  <label>Название трека <span className="required">*</span></label>
                  <input
                    type="text"
                    value={trackForm.name}
                    onChange={e => setTrackForm({ ...trackForm, name: e.target.value })}
                    placeholder="Например: Blinding Lights"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Дата релиза <span className="required">*</span></label>
                  <input
                    type="date"
                    value={trackForm.releaseDate}
                    onChange={e => setTrackForm({ ...trackForm, releaseDate: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Длительность (секунды) <span className="required">*</span></label>
                  <input
                    type="number"
                    value={trackForm.duration}
                    onChange={e => setTrackForm({ ...trackForm, duration: e.target.value })}
                    placeholder="Например: 200"
                    required
                  />
                  <small>Пример: 200 сек = 3:20</small>
                </div>
                <div className="input-group">
                  <label>Исполнители</label>
                  {trackForm.artists.map((artist, idx) => (
                    <div key={idx} className="artist-row">
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
                      <label className="checkbox-label">
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
                        className="remove-artist"
                        onClick={() => {
                          const newArtists = trackForm.artists.filter((_, i) => i !== idx);
                          setTrackForm({ ...trackForm, artists: newArtists });
                        }}
                      >🗑️</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-btn"
                    onClick={() => setTrackForm({
                      ...trackForm,
                      artists: [...trackForm.artists, { artistId: '', isPrimary: false }]
                    })}
                  >+ Добавить исполнителя</button>
                </div>

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
                  <label>Аудиофайл (mp3) <span className="required">*</span></label>
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
                <button type="submit" disabled={submitting || !trackForm.name || !trackForm.trackFile}>
                  {submitting ? 'Загрузка...' : '🎵 Создать трек'}
                </button>
              </form>
            </div>

            <div className="items-grid">
              <h3>🎵 Существующие треки</h3>
              {loading && <div className="loading-spinner">Загрузка...</div>}
              {!loading && tracks.length === 0 && <div className="empty-state">🎧 Треки не найдены</div>}
              <div className="grid">
                {tracks.map(track => (
                  <div className="item-card" key={track.trackId}>
                    {editingTrack === track.trackId ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editingTrackData.name}
                          onChange={e => setEditingTrackData({ ...editingTrackData, name: e.target.value })}
                          placeholder="Название"
                        />
                        <input
                          type="date"
                          value={editingTrackData.releaseDate}
                          onChange={e => setEditingTrackData({ ...editingTrackData, releaseDate: e.target.value })}
                        />
                        <input
                          type="number"
                          value={editingTrackData.duration}
                          onChange={e => setEditingTrackData({ ...editingTrackData, duration: e.target.value })}
                          placeholder="Длительность"
                        />
                        <div className="input-group">
                          <label>Исполнители</label>
                          {editingTrackData.artists.map((artist, idx) => (
                            <div key={idx} className="artist-row">
                              <select
                                value={artist.artistId}
                                onChange={e => {
                                  const newArtists = [...editingTrackData.artists];
                                  newArtists[idx].artistId = Number(e.target.value);
                                  setEditingTrackData({ ...editingTrackData, artists: newArtists });
                                }}
                              >
                                <option value="">Выберите артиста</option>
                                {artists.map(a => (
                                  <option key={a.artistId} value={a.artistId}>{a.name}</option>
                                ))}
                              </select>
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={artist.isPrimary}
                                  onChange={e => {
                                    const newArtists = [...editingTrackData.artists];
                                    if (e.target.checked) {
                                      newArtists.forEach(a => a.isPrimary = false);
                                      newArtists[idx].isPrimary = true;
                                    } else {
                                      newArtists[idx].isPrimary = false;
                                    }
                                    setEditingTrackData({ ...editingTrackData, artists: newArtists });
                                  }}
                                />
                                Основной
                              </label>
                              <button
                                type="button"
                                className="remove-artist"
                                onClick={() => {
                                  const newArtists = editingTrackData.artists.filter((_, i) => i !== idx);
                                  setEditingTrackData({ ...editingTrackData, artists: newArtists });
                                }}
                              >🗑️</button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="add-btn"
                            onClick={() => setEditingTrackData({
                              ...editingTrackData,
                              artists: [...editingTrackData.artists, { artistId: '', isPrimary: false }]
                            })}
                          >+ Добавить исполнителя</button>
                        </div>

                        <select
                          multiple
                          value={editingTrackData.genreIds}
                          onChange={e => {
                            const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value));
                            setEditingTrackData({ ...editingTrackData, genreIds: selected });
                          }}
                          style={{ height: '80px' }}
                        >
                          {genres.map(g => (
                            <option key={g.genreId} value={g.genreId}>{g.name}</option>
                          ))}
                        </select>

                        {editingTrackData.trackUrl && (
                          <div>
                            <label>Текущий аудио:</label>
                            <audio controls src={`http://localhost:5043${editingTrackData.trackUrl}`} style={{ width: '100%' }} />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={e => setEditingTrackData({ ...editingTrackData, trackFile: e.target.files[0] })}
                        />
                        {editingTrackData.coverUrl && (
                          <div className="edit-cover">
                            <label>Текущая обложка:</label>
                            <img src={`http://localhost:5043${editingTrackData.coverUrl}`} width="80" alt="cover" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => setEditingTrackData({ ...editingTrackData, coverFile: e.target.files[0] })}
                        />
                        <div className="edit-actions">
                          <button onClick={handleUpdateTrackSubmit} disabled={updating}>
                            {updating ? 'Сохранение...' : '💾 Сохранить'}
                          </button>
                          <button onClick={() => setEditingTrack(null)}>❌ Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="item-icon">
                          {track.coverUrl ? (
                            <img src={`http://localhost:5043${track.coverUrl}`} alt="cover" />
                          ) : (
                            <span className="no-image">🎵</span>
                          )}
                        </div>
                        <div className="item-info">
                          <h4>{track.name}</h4>
                          <p>
                            🎤 Исполнители:{' '}
                            {track.artists?.map((a, idx) => (
                              <span key={a.artistId}>
                                {a.name}{a.isPrimary && ' (осн.)'}
                                {idx < track.artists.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </p>
                          <p>🎸 Жанры: {track.genres?.join(', ') || '—'}</p>
                          <p>📅 Дата: {new Date(track.releaseDate).toLocaleDateString()}</p>
                          <p>⏱️ Длительность: {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</p>
                        </div>
                        <div className="card-actions">
                          <button className="edit-btn" onClick={() => startEditTrack(track.trackId)} title="Редактировать">✏️</button>
                          <button className="delete-btn" onClick={() => handleDeleteTrack(track.trackId)} title="Удалить">🗑️</button>
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
    </div>
  );
};

export default AdminPage;