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

async createTrack(formData) {
  // было: /Tracks, стало: /Track
  const res = await fetch(`${API_BASE_URL}/Track`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create track');
  return res.json();
},

async updateTrack(id, formData) {
  formData.append('trackId', id);
  // было: /Tracks/${id}, стало: /Track/${id}
  const res = await fetch(`${API_BASE_URL}/Track/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update track');
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
};