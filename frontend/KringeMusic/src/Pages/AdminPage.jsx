// AdminPage.jsx (исправленная версия)
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
  const [isDurationLoading, setIsDurationLoading] = useState(false);

  // Жанры
  const [genreForm, setGenreForm] = useState({ name: '' });
  const [editingGenre, setEditingGenre] = useState(null);
  const [editingGenreData, setEditingGenreData] = useState({ name: '' });

  // Альбомы
  const [albums, setAlbums] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [albumForm, setAlbumForm] = useState({
    name: '',
    releaseDate: '',
    coverFile: null,
    trackIds: [],
  });
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [editingAlbumData, setEditingAlbumData] = useState({
    name: '',
    releaseDate: '',
    coverUrl: null,
    coverFile: null,
    trackIds: [],
  });

  // Модалка для быстрого создания трека (внутри альбома)
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [quickTrackForm, setQuickTrackForm] = useState({
    name: '',
    duration: '',
    releaseDate: '',
    genreIds: [],
    trackFile: null,
    coverFile: null,
  });
  const [creatingQuickTrack, setCreatingQuickTrack] = useState(false);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [submittingAlbum, setSubmittingAlbum] = useState(false);
  const [updatingAlbum, setUpdatingAlbum] = useState(false);
  const albumCoverInputRef = useRef(null);
  const editAlbumCoverInputRef = useRef(null);

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

  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Refs для файлов
  const fileInputRef = useRef(null);
  const labelCoverInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const trackCoverInputRef = useRef(null);

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  const getAudioDuration = (file) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(Math.round(audio.duration));
      });
      audio.addEventListener('error', (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      });
      audio.src = url;
    });
  };

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
      alert('Ошибка загрузки жанров');
    }
  };

  const loadAlbums = async () => {
    if (!selectedArtistId) {
      setAlbums([]);
      return;
    }
    setLoadingAlbums(true);
    try {
      const data = await api.getArtistAlbums(selectedArtistId, 1, 100);
      setAlbums(data);
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки альбомов');
    } finally {
      setLoadingAlbums(false);
    }
  };

  // ========== ТРЕКИ (основная форма) ==========
  const handleTrackSubmit = async (e) => {
    e.preventDefault();

    if (!trackForm.duration || Number(trackForm.duration) <= 0) {
  alert('Длительность трека не задана или равна нулю');
  return;
}

    const validArtists = trackForm.artists.filter(a => a.artistId && a.artistId !== '');
    if (validArtists.length === 0) {
      alert('Добавьте хотя бы одного исполнителя');
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append('Name', trackForm.name);
    fd.append('Duration', trackForm.duration);
    // Отправляем дату как YYYY-MM-DD (без преобразования в UTC)
    fd.append('ReleaseDate', trackForm.releaseDate);
    fd.append('TrackFile', trackForm.trackFile);
    if (trackForm.coverFile) fd.append('CoverFile', trackForm.coverFile);

    const artistsJson = JSON.stringify(validArtists.map(a => ({
      artistId: Number(a.artistId),
      isPrimary: a.isPrimary
    })));
    fd.append('ArtistsJson', artistsJson);
    fd.append('GenreIdsJson', JSON.stringify(trackForm.genreIds.map(id => Number(id))));

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
    const validArtists = editingTrackData.artists.filter(a => a.artistId && a.artistId !== '');
    if (validArtists.length === 0) {
      alert('Добавьте хотя бы одного исполнителя');
      return;
    }

    setUpdating(true);
    const fd = new FormData();
    fd.append('Name', editingTrackData.name);
    fd.append('Duration', editingTrackData.duration);
    fd.append('ReleaseDate', editingTrackData.releaseDate); // уже YYYY-MM-DD
    if (editingTrackData.trackFile) fd.append('TrackFile', editingTrackData.trackFile);
    if (editingTrackData.coverFile) fd.append('CoverFile', editingTrackData.coverFile);

    const artistsArray = validArtists.map(a => ({
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

  // ========== БЫСТРОЕ СОЗДАНИЕ ТРЕКА (модалка) ==========
  const handleQuickTrackSubmit = async (e) => {
    e.preventDefault();
    if (!quickTrackForm.name || !quickTrackForm.duration || !quickTrackForm.trackFile) {
      alert('Заполните название, длительность и загрузите аудиофайл');
      return;
    }

    setCreatingQuickTrack(true);
    const fd = new FormData();
    fd.append('Name', quickTrackForm.name);
    fd.append('Duration', quickTrackForm.duration);
    // Используем дату из формы, если нет – дату альбома (тоже строка YYYY-MM-DD)
    const releaseDate = quickTrackForm.releaseDate || albumForm.releaseDate;
    fd.append('ReleaseDate', releaseDate);
    fd.append('TrackFile', quickTrackForm.trackFile);
    if (quickTrackForm.coverFile) fd.append('CoverFile', quickTrackForm.coverFile);

    const artistsArray = [{ artistId: Number(selectedArtistId), isPrimary: true }];
    fd.append('artistsJson', JSON.stringify(artistsArray));
    fd.append('genreIdsJson', JSON.stringify(quickTrackForm.genreIds.map(id => Number(id))));

    try {
      const newTrack = await api.createTrack(fd);
      alert('Трек успешно создан');
      await loadTracks();

      // Добавляем ID нового трека в текущий альбом
      if (editingAlbum) {
        setEditingAlbumData(prev => ({
          ...prev,
          trackIds: [...prev.trackIds, newTrack.trackId]
        }));
      } else {
        setAlbumForm(prev => ({
          ...prev,
          trackIds: [...prev.trackIds, newTrack.trackId]
        }));
      }

      setShowTrackModal(false);
      setQuickTrackForm({
        name: '',
        duration: '',
        releaseDate: '',
        genreIds: [],
        trackFile: null,
        coverFile: null,
      });
    } catch (err) {
      alert('Ошибка создания трека: ' + err.message);
    } finally {
      setCreatingQuickTrack(false);
    }
  };

  // ========== АЛЬБОМЫ ==========
  const handleAlbumSubmit = async (e) => {
    e.preventDefault();
    if (!selectedArtistId) {
      alert('Сначала выберите артиста');
      return;
    }
    setSubmittingAlbum(true);
    const fd = new FormData();
    fd.append('ArtistId', selectedArtistId);
    fd.append('Name', albumForm.name);
    fd.append('ReleaseDate', albumForm.releaseDate);
    if (albumForm.coverFile) fd.append('CoverFile', albumForm.coverFile);
    albumForm.trackIds.forEach(id => fd.append('TrackIds', id));

    try {
      await api.createAlbum(selectedArtistId, fd);
      alert('Альбом создан');
      setAlbumForm({ name: '', releaseDate: '', coverFile: null, trackIds: [] });
      if (albumCoverInputRef.current) albumCoverInputRef.current.value = '';
      loadAlbums();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      setSubmittingAlbum(false);
    }
  };

  const startEditAlbum = async (album) => {
    try {
      const fullAlbum = await api.getAlbum(selectedArtistId, album.albumId);
      setEditingAlbumData({
        name: fullAlbum.name,
        releaseDate: fullAlbum.releaseDate?.split('T')[0] || '',
        coverUrl: fullAlbum.coverUrl,
        coverFile: null,
        trackIds: fullAlbum.tracks?.map(t => t.trackId) || [],
      });
      setEditingAlbum(album.albumId);
    } catch (err) {
      alert('Ошибка загрузки альбома: ' + err.message);
    }
  };

  const handleUpdateAlbumSubmit = async () => {
    if (!selectedArtistId || !editingAlbum) return;
    setUpdatingAlbum(true);
    const fd = new FormData();
    fd.append('ArtistId', selectedArtistId);
    fd.append('AlbumId', editingAlbum);
    fd.append('Name', editingAlbumData.name);
    fd.append('ReleaseDate', editingAlbumData.releaseDate);
    if (editingAlbumData.coverFile) fd.append('CoverFile', editingAlbumData.coverFile);
    editingAlbumData.trackIds.forEach(id => fd.append('TrackIds', id));

    try {
      await api.updateAlbum(selectedArtistId, editingAlbum, fd);
      alert('Альбом обновлён');
      setEditingAlbum(null);
      loadAlbums();
    } catch (err) {
      alert('Ошибка обновления: ' + err.message);
    } finally {
      setUpdatingAlbum(false);
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (!window.confirm('Удалить альбом?')) return;
    try {
      await api.deleteAlbum(selectedArtistId, albumId);
      loadAlbums();
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
    }
  };

  // ========== АРТИСТЫ ==========
  const handleArtistSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append('Name', artistForm.name);
    fd.append('Description', artistForm.description);
    if (artistForm.labelId) fd.append('LabelId', artistForm.labelId);
    if (artistForm.coverFile) fd.append('CoverFile', artistForm.coverFile);
    artistForm.genreIds.forEach((id) => fd.append('GenreIds', id));

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
      let labelId = artist.labelId;
      if (!labelId && artist.labelName && labels.length) {
        const found = labels.find(l => l.name === artist.labelName);
        if (found) labelId = found.labelId;
      }
      setEditingArtistData({
        name: artist.name,
        description: artist.description || '',
        labelId: labelId || '',
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
    editingArtistData.genreIds.forEach((id) => fd.append('GenreIds', id));

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

  // ========== ЖАНРЫ ==========
  const handleGenreSubmit = async (e) => {
    e.preventDefault();
    if (!genreForm.name.trim()) return;
    setSubmitting(true);
    try {
      await api.createGenre(genreForm.name.trim());
      alert('Жанр создан');
      setGenreForm({ name: '' });
      await loadGenres();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditGenre = (genre) => {
    setEditingGenre(genre.genreId);
    setEditingGenreData({ name: genre.name });
  };

  const handleUpdateGenreSubmit = async () => {
    if (!editingGenreData.name.trim()) return;
    setUpdating(true);
    try {
      await api.updateGenre(editingGenre, editingGenreData.name.trim());
      alert('Жанр обновлён');
      setEditingGenre(null);
      await loadGenres();
    } catch (err) {
      alert('Ошибка обновления: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteGenre = async (id) => {
    if (window.confirm('Удалить жанр? Это действие может затронуть артистов и треки, связанные с ним.')) {
      try {
        await api.deleteGenre(id);
        await loadGenres();
      } catch (err) {
        alert('Ошибка удаления: ' + err.message);
      }
    }
  };

  // ========== ХУКИ ==========
  useEffect(() => {
    if (activeTab === 'artists') loadArtists();
    if (activeTab === 'labels') loadLabels();
    if (activeTab === 'tracks') loadTracks();
    if (activeTab === 'genres') loadGenres();
    if (activeTab === 'albums') {
      loadTracks();
      if (selectedArtistId) loadAlbums();
    }
  }, [activeTab]);

  useEffect(() => {
    loadLabels();
    loadArtists();
    loadGenres();
    loadTracks(); // заранее загружаем треки для альбомов
  }, []);

  useEffect(() => {
    const savedArtistId = localStorage.getItem('selectedArtistId');
    if (savedArtistId) setSelectedArtistId(savedArtistId);
  }, []);

  useEffect(() => {
    if (selectedArtistId) {
      localStorage.setItem('selectedArtistId', selectedArtistId);
    } else {
      localStorage.removeItem('selectedArtistId');
    }
  }, [selectedArtistId]);

  useEffect(() => {
    if (activeTab === 'albums' && selectedArtistId) {
      loadAlbums();
    }
  }, [selectedArtistId, activeTab]);

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
          <h1>Панель управления</h1>
        </div>
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'artists' ? 'active' : ''}`} onClick={() => setActiveTab('artists')}>
            Артисты
          </button>
          <button className={`tab-btn ${activeTab === 'labels' ? 'active' : ''}`} onClick={() => setActiveTab('labels')}>
            Лейблы
          </button>
          <button className={`tab-btn ${activeTab === 'tracks' ? 'active' : ''}`} onClick={() => setActiveTab('tracks')}>
            Треки
          </button>
          <button className={`tab-btn ${activeTab === 'genres' ? 'active' : ''}`} onClick={() => setActiveTab('genres')}>
            Жанры
          </button>
          <button className={`tab-btn ${activeTab === 'albums' ? 'active' : ''}`} onClick={() => setActiveTab('albums')}>
            Альбомы
          </button>
        </div>

        {/* ---------- АРТИСТЫ ---------- */}
        {activeTab === 'artists' && (
          <div className="section">
            <div className="form-card admin-form">
              <h3>Добавить артиста</h3>
              <form onSubmit={handleArtistSubmit}>
                <div className="input-group">
                  <label>Имя артиста <span className="required">*</span></label>
                  <input type="text" value={artistForm.name} onChange={e => setArtistForm({ ...artistForm, name: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Фото / обложка</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setArtistForm({ ...artistForm, coverFile: e.target.files[0] })} />
                </div>
                <div className="input-group">
                  <label>Описание</label>
                  <textarea rows="3" value={artistForm.description} onChange={e => setArtistForm({ ...artistForm, description: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Жанры (можно выбрать несколько)</label>
                  <select multiple value={artistForm.genreIds} onChange={e => setArtistForm({ ...artistForm, genreIds: Array.from(e.target.selectedOptions, opt => Number(opt.value)) })} style={{ height: '100px' }}>
                    {genres.map(genre => <option key={genre.genreId} value={genre.genreId}>{genre.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Лейбл</label>
                  <select value={artistForm.labelId} onChange={e => setArtistForm({ ...artistForm, labelId: e.target.value })}>
                    <option value="">— Без лейбла —</option>
                    {labels.map(label => <option key={label.labelId} value={label.labelId}>{label.name}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={submitting || !artistForm.name}>{submitting ? 'Создание...' : 'Создать артиста'}</button>
              </form>
            </div>
            <div className="items-grid">
              <h3>Существующие артисты</h3>
              <div className="grid">
                {artists.map(artist => (
                  <div className="item-card" key={artist.artistId}>
                    {editingArtist === artist.artistId ? (
                      <div className="edit-form">
                        <input type="text" value={editingArtistData.name} onChange={e => setEditingArtistData({ ...editingArtistData, name: e.target.value })} />
                        <textarea value={editingArtistData.description} onChange={e => setEditingArtistData({ ...editingArtistData, description: e.target.value })} />
                        <select value={editingArtistData.labelId} onChange={e => setEditingArtistData({ ...editingArtistData, labelId: e.target.value })}>
                          <option value="">— Без лейбла —</option>
                          {labels.map(l => <option key={l.labelId} value={l.labelId}>{l.name}</option>)}
                        </select>
                        {editingArtistData.coverUrl && <img src={`http://localhost:5043${editingArtistData.coverUrl}`} width="80" alt="current" />}
                        <input type="file" accept="image/*" onChange={e => setEditingArtistData({ ...editingArtistData, coverFile: e.target.files[0] })} />
                        <select multiple value={editingArtistData.genreIds} onChange={e => setEditingArtistData({ ...editingArtistData, genreIds: Array.from(e.target.selectedOptions, opt => Number(opt.value)) })} style={{ height: '80px' }}>
                          {genres.map(g => <option key={g.genreId} value={g.genreId}>{g.name}</option>)}
                        </select>
                        <div className="edit-actions">
                          <button onClick={handleUpdateArtistSubmit} disabled={updating}>{updating ? 'Сохранение...' : 'Сохранить'}</button>
                          <button onClick={() => setEditingArtist(null)}>Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="item-icon">
                          {artist.coverUrl ? <img src={`http://localhost:5043${artist.coverUrl}`} alt="cover" /> : <span className="no-image">🎤</span>}
                        </div>
                        <div className="item-info">
                          <h4>{artist.name}</h4>
                          <p>Лейбл: {artist.labelName || getLabelName(artist.labelId)}</p>
                          <p>Жанры: {artist.genres?.join(', ') || '—'}</p>
                          <p>Треков: {artist.tracksCount || 0}</p>
                        </div>
                        <div className="card-actions">
                          <button className="edit-btn" onClick={() => startEditArtist(artist.artistId)}>✏️</button>
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
              <h3>Добавить лейбл</h3>
              <form onSubmit={handleLabelSubmit}>
                <div className="input-group"><label>Название лейбла *</label><input type="text" value={labelForm.name} onChange={e => setLabelForm({ ...labelForm, name: e.target.value })} required /></div>
                <div className="input-group"><label>Страна</label><input type="text" value={labelForm.country} onChange={e => setLabelForm({ ...labelForm, country: e.target.value })} /></div>
                <div className="input-group"><label>Логотип / обложка</label><input type="file" accept="image/*" ref={labelCoverInputRef} onChange={e => setLabelForm({ ...labelForm, coverFile: e.target.files[0] })} /></div>
                <button type="submit" disabled={submitting || !labelForm.name}>{submitting ? 'Создание...' : 'Создать лейбл'}</button>
              </form>
            </div>
            <div className="items-grid">
              <h3>Существующие лейблы</h3>
              <div className="grid">
                {labels.map(label => (
                  <div className="item-card" key={label.labelId}>
                    {editingLabel === label.labelId ? (
                      <div className="edit-form">
                        <input type="text" value={editingLabelData.name} onChange={e => setEditingLabelData({ ...editingLabelData, name: e.target.value })} />
                        <input type="text" value={editingLabelData.country} onChange={e => setEditingLabelData({ ...editingLabelData, country: e.target.value })} />
                        {editingLabelData.logoUrl && <img src={`http://localhost:5043${editingLabelData.logoUrl}`} width="60" height="60" alt="logo" />}
                        <input type="file" accept="image/*" onChange={e => setEditingLabelData({ ...editingLabelData, logoFile: e.target.files[0] })} />
                        <div className="edit-actions"><button onClick={handleUpdateLabelSubmit} disabled={updating}>{updating ? 'Сохранение...' : 'Сохранить'}</button><button onClick={() => setEditingLabel(null)}>Отмена</button></div>
                      </div>
                    ) : (
                      <>
                        <div className="item-icon">{label.logoUrl ? <img src={`http://localhost:5043${label.logoUrl}`} alt={label.name} /> : <span className="no-image">🏷️</span>}</div>
                        <div className="item-info"><h4>{label.name}</h4>{label.country && <p>Страна: {label.country}</p>}<p>Артистов: {label.artistsCount || 0}</p></div>
                        <div className="card-actions"><button className="edit-btn" onClick={() => startEditLabel(label.labelId)}>✏️</button><button className="delete-btn" onClick={() => handleDeleteLabel(label.labelId)}>🗑️</button></div>
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
              <h3>Добавить трек</h3>
              <form onSubmit={handleTrackSubmit}>
                <div className="input-group"><label>Название трека *</label><input type="text" value={trackForm.name} onChange={e => setTrackForm({ ...trackForm, name: e.target.value })} required /></div>
                <div className="input-group"><label>Дата релиза *</label><input type="date" value={trackForm.releaseDate} onChange={e => setTrackForm({ ...trackForm, releaseDate: e.target.value })} required /></div>
                <div className="input-group"><label>Длительность (секунды) *</label><input type="number" value={trackForm.duration} onChange={e => setTrackForm({ ...trackForm, duration: e.target.value })} required /></div>
                <div className="input-group">
                  <label>Исполнители</label>
                  {trackForm.artists.map((artist, idx) => (
                    <div key={idx} className="artist-row">
                      <select value={artist.artistId} onChange={e => { const newArtists = [...trackForm.artists]; newArtists[idx].artistId = Number(e.target.value); setTrackForm({ ...trackForm, artists: newArtists }); }}>
                        <option value="">Выберите артиста</option>
                        {artists.map(a => <option key={a.artistId} value={a.artistId}>{a.name}</option>)}
                      </select>
                      <label><input type="checkbox" checked={artist.isPrimary} onChange={e => { const newArtists = [...trackForm.artists]; if (e.target.checked) { newArtists.forEach(a => a.isPrimary = false); newArtists[idx].isPrimary = true; } else { newArtists[idx].isPrimary = false; } setTrackForm({ ...trackForm, artists: newArtists }); }} /> Основной</label>
                      <button type="button" className="remove-artist" onClick={() => setTrackForm({ ...trackForm, artists: trackForm.artists.filter((_, i) => i !== idx) })}>Удалить</button>
                    </div>
                  ))}
                  <button type="button" className="add-btn" onClick={() => setTrackForm({ ...trackForm, artists: [...trackForm.artists, { artistId: '', isPrimary: false }] })}>+ Добавить исполнителя</button>
                </div>
                <div className="input-group">
                  <label>Жанры</label>
                  <select multiple value={trackForm.genreIds} onChange={e => setTrackForm({ ...trackForm, genreIds: Array.from(e.target.selectedOptions, opt => Number(opt.value)) })} style={{ height: '100px' }}>
                    {genres.map(genre => <option key={genre.genreId} value={genre.genreId}>{genre.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Аудиофайл (mp3) *</label>
                  <input type="file" accept="audio/*" ref={audioInputRef} onChange={async (e) => {
  const file = e.target.files[0];
  if (file) {
    setIsDurationLoading(true);
    try {
      const duration = await getAudioDuration(file);
      setTrackForm({ ...trackForm, trackFile: file, duration: duration.toString() });
    } catch (err) {
      alert('Не удалось определить длительность файла');
      setTrackForm({ ...trackForm, trackFile: file, duration: '' });
    } finally {
      setIsDurationLoading(false);
    }
  } else {
    setTrackForm({ ...trackForm, trackFile: null, duration: '' });
  }
}} required />
                </div>
                <div className="input-group"><label>Обложка трека (опционально)</label><input type="file" accept="image/*" ref={trackCoverInputRef} onChange={e => setTrackForm({ ...trackForm, coverFile: e.target.files[0] })} /></div>
                <button type="submit" disabled={submitting || isDurationLoading || !trackForm.name || !trackForm.trackFile || !trackForm.duration}>
  {submitting ? 'Загрузка...' : 'Создать трек'}
</button>
              </form>
            </div>
            <div className="items-grid">
              <h3>Существующие треки</h3>
              <div className="grid">
                {tracks.map(track => (
                  <div className="item-card" key={track.trackId}>
                    {editingTrack === track.trackId ? (
                      <div className="edit-form">
                        <input type="text" value={editingTrackData.name} onChange={e => setEditingTrackData({ ...editingTrackData, name: e.target.value })} />
                        <input type="date" value={editingTrackData.releaseDate} onChange={e => setEditingTrackData({ ...editingTrackData, releaseDate: e.target.value })} />
                        <input type="number" value={editingTrackData.duration} onChange={e => setEditingTrackData({ ...editingTrackData, duration: e.target.value })} />
                        <div className="input-group">
                          <label>Исполнители</label>
                          {editingTrackData.artists.map((artist, idx) => (
                            <div key={idx} className="artist-row">
                              <select value={artist.artistId} onChange={e => { const newArtists = [...editingTrackData.artists]; newArtists[idx].artistId = Number(e.target.value); setEditingTrackData({ ...editingTrackData, artists: newArtists }); }}>
                                <option value="">Выберите артиста</option>
                                {artists.map(a => <option key={a.artistId} value={a.artistId}>{a.name}</option>)}
                              </select>
                              <label><input type="checkbox" checked={artist.isPrimary} onChange={e => { const newArtists = [...editingTrackData.artists]; if (e.target.checked) { newArtists.forEach(a => a.isPrimary = false); newArtists[idx].isPrimary = true; } else { newArtists[idx].isPrimary = false; } setEditingTrackData({ ...editingTrackData, artists: newArtists }); }} /> Основной</label>
                              <button type="button" className="remove-artist" onClick={() => setEditingTrackData({ ...editingTrackData, artists: editingTrackData.artists.filter((_, i) => i !== idx) })}>Удалить</button>
                            </div>
                          ))}
                          <button type="button" className="add-btn" onClick={() => setEditingTrackData({ ...editingTrackData, artists: [...editingTrackData.artists, { artistId: '', isPrimary: false }] })}>+ Добавить исполнителя</button>
                        </div>
                        <select multiple value={editingTrackData.genreIds} onChange={e => setEditingTrackData({ ...editingTrackData, genreIds: Array.from(e.target.selectedOptions, opt => Number(opt.value)) })} style={{ height: '80px' }}>
                          {genres.map(g => <option key={g.genreId} value={g.genreId}>{g.name}</option>)}
                        </select>
                        {editingTrackData.trackUrl && <audio controls src={`http://localhost:5043${editingTrackData.trackUrl}`} style={{ width: '100%' }} />}
                        <input type="file" accept="audio/*" onChange={e => setEditingTrackData({ ...editingTrackData, trackFile: e.target.files[0] })} />
                        {editingTrackData.coverUrl && <img src={`http://localhost:5043${editingTrackData.coverUrl}`} width="80" alt="cover" />}
                        <input type="file" accept="image/*" onChange={e => setEditingTrackData({ ...editingTrackData, coverFile: e.target.files[0] })} />
                        <div className="edit-actions"><button onClick={handleUpdateTrackSubmit} disabled={updating}>{updating ? 'Сохранение...' : 'Сохранить'}</button><button onClick={() => setEditingTrack(null)}>Отмена</button></div>
                      </div>
                    ) : (
                      <>
                        <div className="item-icon">{track.coverUrl ? <img src={`http://localhost:5043${track.coverUrl}`} alt="cover" /> : <span className="no-image">🎵</span>}</div>
                        <div className="item-info">
                          <h4>{track.name}</h4>
                          <p>Исполнители: {track.artists?.map((a, idx) => <span key={a.artistId}>{a.name}{a.isPrimary && ' (осн.)'}{idx < track.artists.length - 1 ? ', ' : ''}</span>)}</p>
                          <p>Жанры: {track.genres?.join(', ') || '—'}</p>
                          <p>Дата: {new Date(track.releaseDate).toLocaleDateString()}</p>
                          <p>Длительность: {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</p>
                        </div>
                        <div className="card-actions"><button className="edit-btn" onClick={() => startEditTrack(track.trackId)}>✏️</button><button className="delete-btn" onClick={() => handleDeleteTrack(track.trackId)}>🗑️</button></div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------- ЖАНРЫ ---------- */}
        {activeTab === 'genres' && (
          <div className="section">
            <div className="form-card admin-form">
              <h3>Добавить жанр</h3>
              <form onSubmit={handleGenreSubmit}>
                <div className="input-group"><label>Название жанра *</label><input type="text" value={genreForm.name} onChange={e => setGenreForm({ name: e.target.value })} required /></div>
                <button type="submit" disabled={submitting || !genreForm.name.trim()}>{submitting ? 'Создание...' : 'Создать жанр'}</button>
              </form>
            </div>
            <div className="items-grid">
              <h3>Существующие жанры</h3>
              <div className="grid">
                {genres.map(genre => (
                  <div className="item-card" key={genre.genreId}>
                    {editingGenre === genre.genreId ? (
                      <div className="edit-form">
                        <input type="text" value={editingGenreData.name} onChange={e => setEditingGenreData({ name: e.target.value })} autoFocus />
                        <div className="edit-actions"><button onClick={handleUpdateGenreSubmit} disabled={updating}>{updating ? 'Сохранение...' : 'Сохранить'}</button><button onClick={() => setEditingGenre(null)}>Отмена</button></div>
                      </div>
                    ) : (
                      <>
                        <div className="item-icon"><span className="no-image">🎸</span></div>
                        <div className="item-info"><h4>{genre.name}</h4></div>
                        <div className="card-actions"><button className="edit-btn" onClick={() => startEditGenre(genre)}>✏️</button><button className="delete-btn" onClick={() => handleDeleteGenre(genre.genreId)}>🗑️</button></div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------- АЛЬБОМЫ ---------- */}
        {activeTab === 'albums' && (
          <div className="section">
            <div className="form-card" style={{ marginBottom: '20px' }}>
              <div className="input-group">
                <label>Выберите артиста *</label>
                <select value={selectedArtistId} onChange={e => setSelectedArtistId(e.target.value)}>
                  <option value="">— Выберите артиста —</option>
                  {artists.map(artist => <option key={artist.artistId} value={artist.artistId}>{artist.name}</option>)}
                </select>
              </div>
            </div>
            {selectedArtistId && (
              <>
                <div className="form-card admin-form">
                  <h3>Добавить альбом</h3>
                  <form onSubmit={handleAlbumSubmit}>
                    <div className="input-group"><label>Название альбома *</label><input type="text" value={albumForm.name} onChange={e => setAlbumForm({ ...albumForm, name: e.target.value })} required /></div>
                    <div className="input-group"><label>Дата релиза *</label><input type="date" value={albumForm.releaseDate} onChange={e => setAlbumForm({ ...albumForm, releaseDate: e.target.value })} required /></div>
                    <div className="input-group"><label>Обложка альбома</label><input type="file" accept="image/*" ref={albumCoverInputRef} onChange={e => setAlbumForm({ ...albumForm, coverFile: e.target.files[0] })} /></div>
                    <div className="input-group">
  <label>Треки (можно выбрать несколько)</label>
  <select
    multiple
    value={albumForm.trackIds}
    onChange={e => setAlbumForm({ ...albumForm, trackIds: Array.from(e.target.selectedOptions, opt => Number(opt.value)) })}
    style={{ height: '150px', width: '100%' }}
  >
    {tracks.map(track => (
      <option key={track.trackId} value={track.trackId}>
        {track.name} – {track.artists?.map(a => a.name).join(', ')}
      </option>
    ))}
  </select>
  <button
    type="button"
    className="add-btn"
    style={{ marginTop: '0.75rem' }}
    onClick={() => {
      setQuickTrackForm(prev => ({ ...prev, releaseDate: albumForm.releaseDate || '' }));
      setShowTrackModal(true);
    }}
  >
    + Создать трек
  </button>
</div>
                    <button type="submit" disabled={submittingAlbum || !albumForm.name || !albumForm.releaseDate}>{submittingAlbum ? 'Создание...' : 'Создать альбом'}</button>
                  </form>
                </div>
                <div className="items-grid">
                  <h3>Альбомы выбранного артиста</h3>
                  <div className="grid">
                    {albums.map(album => (
                      <div className="item-card" key={album.albumId}>
                        {editingAlbum === album.albumId ? (
                          <div className="edit-form">
                            <input type="text" value={editingAlbumData.name} onChange={e => setEditingAlbumData({ ...editingAlbumData, name: e.target.value })} />
                            <input type="date" value={editingAlbumData.releaseDate} onChange={e => setEditingAlbumData({ ...editingAlbumData, releaseDate: e.target.value })} />
                            {editingAlbumData.coverUrl && <img src={`http://localhost:5043${editingAlbumData.coverUrl}`} width="80" alt="cover" />}
                            <input type="file" accept="image/*" ref={editAlbumCoverInputRef} onChange={e => setEditingAlbumData({ ...editingAlbumData, coverFile: e.target.files[0] })} />
                            <div className="input-group">
                              <label>Треки</label>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <select multiple value={editingAlbumData.trackIds} onChange={e => setEditingAlbumData({ ...editingAlbumData, trackIds: Array.from(e.target.selectedOptions, opt => Number(opt.value)) })} style={{ height: '120px', flex: 1 }}>
                                  {tracks.map(track => <option key={track.trackId} value={track.trackId}>{track.name} – {track.artists?.map(a => a.name).join(', ')}</option>)}
                                </select>
                                <button type="button" className="add-btn" onClick={() => { setQuickTrackForm(prev => ({ ...prev, releaseDate: editingAlbumData.releaseDate || '' })); setShowTrackModal(true); }}>+ Создать трек</button>
                              </div>
                            </div>
                            <div className="edit-actions"><button onClick={handleUpdateAlbumSubmit} disabled={updatingAlbum}>{updatingAlbum ? 'Сохранение...' : 'Сохранить'}</button><button onClick={() => setEditingAlbum(null)}>Отмена</button></div>
                          </div>
                        ) : (
                          <>
                            <div className="item-icon">{album.coverUrl ? <img src={`http://localhost:5043${album.coverUrl}`} alt="cover" /> : <span className="no-image">💿</span>}</div>
                            <div className="item-info">
                              <h4>{album.name}</h4>
                              <p>Дата релиза: {new Date(album.releaseDate).toLocaleDateString()}</p>
                              <p>Количество треков: {album.tracksCount || 0}</p>
                              {album.tracks && album.tracks.length > 0 && (
                                <details><summary>Список треков</summary><ul>{album.tracks.map(track => <li key={track.trackId}>{track.name} ({Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')})</li>)}</ul></details>
                              )}
                            </div>
                            <div className="card-actions"><button className="edit-btn" onClick={() => startEditAlbum(album)}>✏️</button><button className="delete-btn" onClick={() => handleDeleteAlbum(album.albumId)}>🗑️</button></div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно для быстрого создания трека */}
      {showTrackModal && (
        <div className="modal-overlay" onClick={() => setShowTrackModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Создать новый трек</h3>
            <form onSubmit={handleQuickTrackSubmit}>
              <div className="input-group"><label>Название трека *</label><input type="text" value={quickTrackForm.name} onChange={e => setQuickTrackForm({ ...quickTrackForm, name: e.target.value })} required /></div>
              <div className="input-group"><label>Длительность (секунды) *</label><input type="number" value={quickTrackForm.duration} onChange={e => setQuickTrackForm({ ...quickTrackForm, duration: e.target.value })} required /></div>
              <div className="input-group"><label>Дата релиза</label><input type="date" value={quickTrackForm.releaseDate} onChange={e => setQuickTrackForm({ ...quickTrackForm, releaseDate: e.target.value })} /><small>Если не указать, будет использована дата альбома</small></div>
              <div className="input-group"><label>Жанры</label><select multiple value={quickTrackForm.genreIds} onChange={e => setQuickTrackForm({ ...quickTrackForm, genreIds: Array.from(e.target.selectedOptions, opt => Number(opt.value)) })} style={{ height: '100px' }}>{genres.map(genre => <option key={genre.genreId} value={genre.genreId}>{genre.name}</option>)}</select></div>
              <div className="input-group"><label>Аудиофайл (mp3) *</label><input type="file" accept="audio/*" onChange={async (e) => { const file = e.target.files[0]; if (file) { try { const duration = await getAudioDuration(file); setQuickTrackForm(prev => ({ ...prev, trackFile: file, duration: duration.toString() })); } catch (err) { setQuickTrackForm(prev => ({ ...prev, trackFile: file })); } } else { setQuickTrackForm(prev => ({ ...prev, trackFile: null, duration: '' })); } }} required /></div>
              <div className="input-group"><label>Обложка трека (опционально)</label><input type="file" accept="image/*" onChange={e => setQuickTrackForm({ ...quickTrackForm, coverFile: e.target.files[0] })} /></div>
              <div className="edit-actions"><button type="submit" disabled={creatingQuickTrack}>{creatingQuickTrack ? 'Создание...' : 'Создать трек'}</button><button type="button" onClick={() => setShowTrackModal(false)}>Отмена</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;