import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { FaClock, FaStepForward, FaCheckCircle } from 'react-icons/fa';
import '../Styles/HistoryPage.css';
import { useNavigate } from 'react-router-dom';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentTrack, setCurrentTrack] = useState(null);

  const fetchHistory = async (currentPage) => {
    setLoading(true);
    try {
      const res = await api.getUserHistory(currentPage, 20);
      setHistory(res.items);
      setTotalPages(Math.ceil(res.totalCount / 20));
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayTrack = async (trackId) => {
    // найти трек в истории (но у нас нет полного объекта трека)
    // можно либо запросить по id, либо передавать больше данных из API
    // упростим: вызовем событие через context – но для простоты переделаем Layout чтобы принимал trackId
    // Поскольку Layout ожидает объект track, лучше запросить трек по ID
    try {
      const track = await api.getTrackById(trackId);
      setCurrentTrack(track);
      await api.recordPlayHistory(trackId, 'history_page', 1, false);
    } catch (err) {
      console.error('Failed to play track', err);
    }
  };

  const getCoverUrl = (coverUrl) => {
    if (!coverUrl) return null;
    if (coverUrl.startsWith('http')) return coverUrl;
    return `http://localhost:5043${coverUrl}`;
  };

  const HistoryRow = ({ item, index }) => (
    <div className="history-row" onClick={() => handlePlayTrack(item.trackId)}>
      <span className="history-date">{formatDate(item.listeningDate)}</span>
      <div className="history-info">
        <div className="history-track-name">{item.trackName}</div>
        <div className="history-artist-name">{item.artistName}</div>
      </div>
      <span className="history-source">{item.source}</span>
      <span className="history-duration">{formatDuration(item.durationPlayed)}</span>
      <span className="history-skipped">
        {item.isSkipped ? <FaStepForward title="Пропущено" /> : <FaCheckCircle title="Дослушано" />}
      </span>
    </div>
  );

  if (loading) return <Layout><div className="loading">Загрузка истории...</div></Layout>;

  return (
    <Layout currentTrack={currentTrack} playerTracks={[]}>
      <div className="history-page">
        <h1>История прослушиваний</h1>
        {history.length === 0 ? (
          <div className="empty-state">Вы ещё ничего не слушали</div>
        ) : (
          <>
            <div className="history-table">
              <div className="history-header">
                <span>Дата</span>
                <span>Трек</span>
                <span>Источник</span>
                <span>Прослушано</span>
                <span>Статус</span>
              </div>
              {history.map((item, idx) => (
                <HistoryRow key={item.historyId} item={item} index={idx} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} disabled={p === page}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default HistoryPage;