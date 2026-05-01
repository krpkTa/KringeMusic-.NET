using Application.DTOs.Playlist;
using Domain;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application
{
    public class DailyPlaylistService
    {
        private const int DailyPlaylistTypeId = 3;
        private const int MaxTracks = 30;
        private readonly IPlaylistRepository _playlistRepository;
        private readonly ITrackRepository _trackRepository;
        private readonly IUserRepository _userRepository;
        private readonly IGenreRepository _genreRepository;
        private readonly IArtistRepository _artistRepository;
        private readonly IPlayHistoryRepository _historyRepository;

        public DailyPlaylistService(
            IPlaylistRepository playlistRepository,
            ITrackRepository trackRepository,
            IUserRepository userRepository,
            IGenreRepository genreRepository,
            IArtistRepository artistRepository,
            IPlayHistoryRepository historyRepository)
        {
            _playlistRepository = playlistRepository;
            _trackRepository = trackRepository;
            _userRepository = userRepository;
            _genreRepository = genreRepository;
            _artistRepository = artistRepository;
            _historyRepository = historyRepository;
        }

        public async Task<PlaylistResponseDto> GetOrGenerateDailyPlaylist(int userId, CancellationToken ct = default)
        {
            var user = await _userRepository.GetUserById(userId);
            if (user == null) throw new Exception("User not found");

            var dailyPlaylist = await _playlistRepository.GetPlaylistById(DailyPlaylistTypeId, userId, 1, ct);
            if (dailyPlaylist == null)
            {
                dailyPlaylist = await _playlistRepository.CreatePlaylist(userId, "Плейлист дня", DailyPlaylistTypeId, ct);
            }

            if (dailyPlaylist.CreatedAt.Date < DateTime.UtcNow.Date)
            {
                await RegenerateDailyPlaylist(userId, dailyPlaylist, ct);
            }

            var trackCount = await _playlistRepository.GetPlaylistTracksCount(dailyPlaylist.TypeId, dailyPlaylist.UserId, dailyPlaylist.PlaylistId, ct);
            string? coverUrl = null;
            var firstTrack = await _playlistRepository.GetPlaylistTracks(dailyPlaylist.TypeId, dailyPlaylist.UserId, dailyPlaylist.PlaylistId, 1, 1, ct);
            if (firstTrack.Any()) coverUrl = firstTrack.First().CoverLink;

            return new PlaylistResponseDto
            {
                TypeId = dailyPlaylist.TypeId,
                UserId = dailyPlaylist.UserId,
                PlaylistId = dailyPlaylist.PlaylistId,
                Name = dailyPlaylist.Name,
                TypeName = "Плейлист дня",
                CreatedAt = dailyPlaylist.CreatedAt,
                TrackCount = trackCount,
                CoverUrl = coverUrl
            };
        }

        private async Task RegenerateDailyPlaylist(int userId, Playlist dailyPlaylist, CancellationToken ct)
        {
            var favoriteGenreIds = await _genreRepository.GetUserGenreIds(userId, ct);
            var favoriteArtistIds = await _artistRepository.GetUserArtistIds(userId, ct);

            var candidateTracks = await _trackRepository.GetRecommendedTracks(favoriteGenreIds, favoriteArtistIds, 200, ct);

            var recentTrackIds = await _historyRepository.GetRecentlyPlayedTrackIds(userId, TimeSpan.FromDays(2), ct);
            var favoriteTrackIds = await _playlistRepository.GetFavoriteTrackIds(userId, ct);

            var filtered = candidateTracks
                .Where(t => !recentTrackIds.Contains(t.TrackId) && !favoriteTrackIds.Contains(t.TrackId))
                .ToList();

            var random = new Random();
            var selected = filtered
                .OrderByDescending(t => t.Duration)   // заменишь на популярность позже
                .ThenBy(t => random.Next())
                .Take(MaxTracks)
                .ToList();

            if (selected.Count < MaxTracks)
            {
                var needed = MaxTracks - selected.Count;
                var existingIds = selected.Select(t => t.TrackId).ToHashSet();
                var globalTop = await _trackRepository.GetTopTracks(needed + 10, ct);
                var additional = globalTop.Where(t => !existingIds.Contains(t.TrackId)).Take(needed);
                selected.AddRange(additional);
            }

            await _playlistRepository.ClearPlaylistTracks(dailyPlaylist.TypeId, dailyPlaylist.UserId, dailyPlaylist.PlaylistId, ct);
            foreach (var track in selected)
            {
                await _playlistRepository.AddTrackToPlaylist(dailyPlaylist.TypeId, dailyPlaylist.UserId, dailyPlaylist.PlaylistId, track.TrackId, ct);
            }

            await _playlistRepository.UpdatePlaylistCreatedAt(dailyPlaylist.TypeId, dailyPlaylist.UserId, dailyPlaylist.PlaylistId, DateTime.UtcNow, ct);
        }

        /// <summary>
        /// Принудительно перегенерировать плейлист дня (сбрасывает дату и вызывает обновление)
        /// </summary>
        public async Task<PlaylistResponseDto> RegenerateDailyPlaylistForce(int userId, CancellationToken ct = default)
        {
            // Получаем или создаём плейлист дня
            var dailyPlaylist = await _playlistRepository.GetPlaylistById(DailyPlaylistTypeId, userId, 1, ct);
            if (dailyPlaylist == null)
            {
                dailyPlaylist = await _playlistRepository.CreatePlaylist(userId, "Плейлист дня", DailyPlaylistTypeId, ct);
            }

            // Сдвигаем дату создания на вчера, чтобы регенерация сработала
            await _playlistRepository.UpdatePlaylistCreatedAt(dailyPlaylist.TypeId, dailyPlaylist.UserId, dailyPlaylist.PlaylistId, DateTime.UtcNow.AddDays(-1), ct);

            // Вызываем регенерацию (она сама обновит список треков и установит сегодняшнюю дату)
            await RegenerateDailyPlaylist(userId, dailyPlaylist, ct);

            // Возвращаем обновлённый плейлист
            return await GetOrGenerateDailyPlaylist(userId, ct);
        }
    }
}