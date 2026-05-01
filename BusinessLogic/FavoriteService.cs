using Application.DTOs.Album;
using Application.DTOs.Track;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application
{
    public class FavoritesService
    {
        private readonly IPlaylistRepository _playlistRepository;
        private readonly ITrackRepository _trackRepository;
        private readonly IUserRepository _userRepository; 
        private readonly IAlbumRepository _albumRepository;

        public FavoritesService(
            IPlaylistRepository playlistRepository,
            ITrackRepository trackRepository,
            IUserRepository userRepository,
            IAlbumRepository albumRepository)
        {
            _playlistRepository = playlistRepository;
            _trackRepository = trackRepository;
            _userRepository = userRepository;
            _albumRepository = albumRepository;
        }

        public async Task AddToFavorites(int userId, int trackId, CancellationToken ct = default)
        {
            var user = await _userRepository.GetUserById(userId);
            if (user == null)
                throw new Exception($"Пользователь с ID {userId} не найден.");

            var track = await _trackRepository.GetTrackById(trackId, ct);
            if (track == null)
                throw new Exception($"Трек с ID {trackId} не найден.");

            var favoritesPlaylist = await _playlistRepository.GetSystemFavoritesPlaylist(userId, ct);
            if (favoritesPlaylist == null)
            {
                favoritesPlaylist = await _playlistRepository.CreateSystemPlaylist(userId, "Избранное", ct);
            }

            var alreadyExists = await _playlistRepository.IsTrackInFavorites(userId, trackId, ct);
            if (alreadyExists)
                throw new Exception("Трек уже находится в избранном.");

            await _playlistRepository.AddTrackToPlaylist(
                favoritesPlaylist.TypeId,
                favoritesPlaylist.UserId,
                favoritesPlaylist.PlaylistId,
                trackId,
                ct);
        }

        public async Task RemoveFromFavorites(int userId, int trackId, CancellationToken ct = default)
        {
            var favoritesPlaylist = await _playlistRepository.GetSystemFavoritesPlaylist(userId, ct);
            if (favoritesPlaylist == null)
                throw new Exception("Плейлист избранного не найден.");

            var exists = await _playlistRepository.IsTrackInFavorites(userId, trackId, ct);
            if (!exists)
                throw new Exception("Трека нет в избранном.");

            await _playlistRepository.RemoveTrackFromPlaylist(
                favoritesPlaylist.TypeId,
                favoritesPlaylist.UserId,
                favoritesPlaylist.PlaylistId,
                trackId,
                ct);
        }

        // Получить список избранных треков (с пагинацией)
        public async Task<(List<FavoriteTrackResponseDto> Items, int TotalCount)> GetFavoriteTracks(
            int userId, int page = 1, int pageSize = 10, CancellationToken ct = default)
        {
            var tracks = await _playlistRepository.GetFavoriteTracks(userId, page, pageSize, ct);
            var total = await _playlistRepository.GetFavoriteTracksCount(userId, ct);

            // Получить даты добавления для каждого трека (можно вернуть через отдельный маппинг)
            // Здесь упрощённо: маппим без даты добавления, но для полноты её можно подтянуть.
            var dtos = tracks.Select(t => new FavoriteTrackResponseDto
            {
                TrackId = t.TrackId,
                Name = t.Name,
                Duration = t.Duration,
                ReleaseDate = t.ReleaseDate,
                CoverLink = t.CoverLink,
                TrackLink = t.TrackLink,
                // AddedAt придётся доставать отдельным запросом, если нужно.
            }).ToList();

            return (dtos, total);
        }

        public async Task AddAlbumToFavorites(int userId, int artistId, int albumId, CancellationToken ct = default)
        {
            var user = await _userRepository.GetUserById(userId);
            if (user == null)
                throw new Exception($"Пользователь с ID {userId} не найден.");

            var album = await _albumRepository.GetAlbumAsync(artistId, albumId, ct);
            if (album == null)
                throw new Exception($"Альбом с ArtistId={artistId}, AlbumId={albumId} не найден.");

            var alreadyExists = await _albumRepository.IsAlbumInFavoritesAsync(userId, artistId, albumId, ct);
            if (alreadyExists)
                throw new Exception("Альбом уже находится в избранном.");

            await _albumRepository.AddToFavoritesAsync(userId, artistId, albumId, ct);
        }

        public async Task RemoveAlbumFromFavorites(int userId, int artistId, int albumId, CancellationToken ct = default)
        {
            var exists = await _albumRepository.IsAlbumInFavoritesAsync(userId, artistId, albumId, ct);
            if (!exists)
                throw new Exception("Альбома нет в избранном.");

            await _albumRepository.RemoveFromFavoritesAsync(userId, artistId, albumId, ct);
        }

        public async Task<(List<FavoriteAlbumResponseDto> Items, int TotalCount)> GetFavoriteAlbums(
            int userId, int page = 1, int pageSize = 10, CancellationToken ct = default)
        {
            var (albums, totalCount) = await _albumRepository.GetFavoriteAlbumsAsync(userId, page, pageSize, ct);

            var dtos = albums.Select(a => new FavoriteAlbumResponseDto
            {
                ArtistId = a.ArtistId,
                AlbumId = a.AlbumId,
                Name = a.Name,
                ArtistName = a.Artist?.Name ?? string.Empty,
                ReleaseDate = a.ReleaseDate,
                CoverLink = a.CoverLink
            }).ToList();

            return (dtos, totalCount);
        }
    }
}
