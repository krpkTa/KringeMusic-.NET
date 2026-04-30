// src/services/api.js
const API_BASE_URL = 'http://localhost:5043/api';

// Заголовки для JSON-запросов (с JWT, если есть)
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Для FormData заголовки не задаём – браузер сам установит multipart boundary

export const api = {
  // ---------- АВТОРИЗАЦИЯ ----------
  async register(login, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, email, password })
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  async login(identifier, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  // ---------- АРТИСТЫ ----------
  async getArtists(search = '', page = 1, pageSize = 10) {
    const params = new URLSearchParams({ search, page: String(page), pageSize: String(pageSize) });
    const res = await fetch(`${API_BASE_URL}/Artists?${params}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch artists');
    return res.json();
  },

  async createArtist(formData) {
    const res = await fetch(`${API_BASE_URL}/Artists`, {
      method: 'POST',
      body: formData, // поля: Name, Description, LabelId, CoverFile
    });
    if (!res.ok) throw new Error('Failed to create artist');
    return res.json();
  },

  async updateArtist(id, formData) {
    formData.append('ArtistId', id);
    const res = await fetch(`${API_BASE_URL}/artists/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to update artist');
    return res.json();
  },
async getArtistById(id) {
  const res = await fetch(`${API_BASE_URL}/Artists/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch artist');
  return res.json();
},
  async deleteArtist(id) {
    const res = await fetch(`${API_BASE_URL}/artists/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete artist');
  },
async getLabels(search = '', page = 1, pageSize = 10) {
  const params = new URLSearchParams({ search, page: String(page), pageSize: String(pageSize) });
  const res = await fetch(`${API_BASE_URL}/RecordLabel?${params}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch labels');
  return res.json();
},
async getLabelById(id) {
  const res = await fetch(`${API_BASE_URL}/RecordLabel/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch label');
  return res.json();
},
// ✔️ Исправлено: принимаем FormData
async createLabel(formData) {
  const res = await fetch(`${API_BASE_URL}/RecordLabel`, {
    method: 'POST',
    body: formData,   // не указываем Content-Type – браузер сам добавит multipart boundary
  });
  if (!res.ok) throw new Error('Failed to create label');
  return res.json();
},

// ✔️ Исправлено: принимаем FormData
async updateLabel(id, formData) {
  // Добавляем id в FormData (если бэкенд ожидает поле LabelId)
  formData.append('LabelId', id);
  const res = await fetch(`${API_BASE_URL}/RecordLabel/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update label');
  return res.json();
},

async deleteLabel(id) {
  const res = await fetch(`${API_BASE_URL}/RecordLabel/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete label');
},

// ---------- ЖАНРЫ (если ещё нет) ----------
async getGenres() {
  const res = await fetch(`${API_BASE_URL}/genres`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
},
// ---------- ТРЕКИ ----------
async getTracks(search = '', page = 1, pageSize = 10) {
  const params = new URLSearchParams({ search, page, pageSize });
  // было: /Tracks, стало: /Track
  const res = await fetch(`${API_BASE_URL}/Track?${params}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch tracks');
  return res.json();
},
async getTrackById(id) {
  const res = await fetch(`${API_BASE_URL}/Track/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch track');
  return res.json();
},
async createTrack(formData) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/Track`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
},

async updateTrack(id, formData) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/Track/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
},

async deleteTrack(id) {
  // было: /Tracks/${id}, стало: /Track/${id}
  const res = await fetch(`${API_BASE_URL}/Track/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete track');
},

// ---------- ЖАНРЫ ----------
async getGenres(search = '', page = 1, pageSize = 100) {
  const params = new URLSearchParams({ search, page, pageSize });
  const res = await fetch(`${API_BASE_URL}/Genre?${params}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
},

async createGenre(name) {
  const res = await fetch(`${API_BASE_URL}/Genre`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create genre');
  return res.json();
},

async updateGenre(id, name) {
  const res = await fetch(`${API_BASE_URL}/Genre/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ genreId: id, name }),
  });
  if (!res.ok) throw new Error('Failed to update genre');
  return res.json();
},

async deleteGenre(id) {
  const res = await fetch(`${API_BASE_URL}/Genre/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete genre');
},
// ---------- АЛЬБОМЫ ----------
// Получить все альбомы артиста (с пагинацией)
async getArtistAlbums(artistId, page = 1, pageSize = 10) {
  const params = new URLSearchParams({ page, pageSize });
  const res = await fetch(`${API_BASE_URL}/artists/${artistId}/albums?${params}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch albums');
  return res.json();
},

// Получить один альбом
async getAlbum(artistId, albumId) {
  const res = await fetch(`${API_BASE_URL}/artists/${artistId}/albums/${albumId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch album');
  return res.json();
},

// Создать альбом
async createAlbum(artistId, formData) {
  const res = await fetch(`${API_BASE_URL}/artists/${artistId}/albums`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create album');
  return res.json();
},

// Обновить альбом
async updateAlbum(artistId, albumId, formData) {
  formData.append('ArtistId', artistId);
  formData.append('AlbumId', albumId);
  const res = await fetch(`${API_BASE_URL}/artists/${artistId}/albums/${albumId}`, {
    method: 'PUT',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update album');
  return res.json();
},

// Удалить альбом
async deleteAlbum(artistId, albumId) {
  const res = await fetch(`${API_BASE_URL}/artists/${artistId}/albums/${albumId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete album');
},

// Добавить треки в альбом
async addTracksToAlbum(artistId, albumId, trackIds) {
  const res = await fetch(`${API_BASE_URL}/artists/${artistId}/albums/${albumId}/tracks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders() },
    body: JSON.stringify({ trackIds }),
  });
  if (!res.ok) throw new Error('Failed to add tracks');
},

// Удалить треки из альбома
async removeTracksFromAlbum(artistId, albumId, trackIds) {
  const res = await fetch(`${API_BASE_URL}/artists/${artistId}/albums/${albumId}/tracks`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getHeaders() },
    body: JSON.stringify({ trackIds }),
  });
  if (!res.ok) throw new Error('Failed to remove tracks');
},

// ---------- ПРЕДПОЧТЕНИЯ ПОЛЬЗОВАТЕЛЯ (онбординг) ----------
async saveUserPreferences(preferences) {
  const res = await fetch(`${API_BASE_URL}/UserPreferences`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(preferences)
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Failed to save preferences');
  }
  return res.json();
},

async getUserPreferences() {
  const res = await fetch(`${API_BASE_URL}/UserPreferences`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch preferences');
  return res.json();
},

async searchTracks(query, page = 1, pageSize = 20) {
  const params = new URLSearchParams({ q: query, page, pageSize });
  const res = await fetch(`${API_BASE_URL}/Search/tracks?${params}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
},

async searchArtists(query, page = 1, pageSize = 10) {
  const params = new URLSearchParams({ q: query, page, pageSize });
  const res = await fetch(`${API_BASE_URL}/Search/artists?${params}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Artist search failed');
  return res.json();
},
async getArtistTracks(artistId, page = 1, pageSize = 100) {
  const params = new URLSearchParams({ page, pageSize });
  const res = await fetch(`${API_BASE_URL}/Artists/${artistId}/tracks?${params}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch artist tracks');
  return res.json(); 
},
// ---------- ИЗБРАННОЕ (ЛАЙКИ) ----------
async likeTrack(trackId) {
  const res = await fetch(`${API_BASE_URL}/favorites/like`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ trackId })
  });
  if (!res.ok) throw new Error('Failed to like track');
  return res.json();
},

async unlikeTrack(trackId) {
  const res = await fetch(`${API_BASE_URL}/favorites/unlike`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ trackId })
  });
  if (!res.ok) throw new Error('Failed to unlike track');
  return res.json();
},

async getFavorites(page = 1, pageSize = 20) {
  const params = new URLSearchParams({ page, pageSize });
  const res = await fetch(`${API_BASE_URL}/favorites?${params}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch favorites');
  return res.json(); // { items, totalCount, page, pageSize }
},

// Опционально: проверить, лайкнут ли конкретный трек (если нужно)
async isTrackLiked(trackId) {
  // Можно реализовать отдельный эндпоинт, но для простоты – после загрузки всех избранных храним Set
}
};

