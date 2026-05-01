using Application.DTOs.Playlist;
using Domain;
using Domain.Interfaces;
using KringeMusic.DTOs.Track;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application
{
    public class PlaylistService
    {
        private readonly IPlaylistRepository _playlistRepository;
        private readonly ITrackRepository _trackRepository;
        private readonly IUserRepository _userRepository;

        public PlaylistService(
            IPlaylistRepository playlistRepository,
            ITrackRepository trackRepository,
            IUserRepository userRepository)
        {
            _playlistRepository = playlistRepository;
            _trackRepository = trackRepository;
            _userRepository = userRepository;
        }

        public async Task<List<PlaylistResponseDto>> GetUserPlaylistsAsync(int userId, CancellationToken ct = default)
        {
            var playlists = await _playlistRepository.GetUserPlaylists(userId, ct);
            var result = new List<PlaylistResponseDto>();

            foreach (var pl in playlists)
            {
                var trackCount = await _playlistRepository.GetPlaylistTracksCount(pl.TypeId, pl.UserId, pl.PlaylistId, ct);
                // Получаем обложку из первого трека плейлиста (если есть)
                string? coverUrl = null;
                var firstTrack = await _playlistRepository.GetPlaylistTracks(pl.TypeId, pl.UserId, pl.PlaylistId, 1, 1, ct);
                if (firstTrack.Any())
                    coverUrl = firstTrack.First().CoverLink;

                result.Add(new PlaylistResponseDto
                {
                    TypeId = pl.TypeId,
                    UserId = pl.UserId,
                    PlaylistId = pl.PlaylistId,
                    Name = pl.Name,
                    TypeName = pl.Type?.Name ?? (pl.TypeId == 1 ? "Избранное" : "Плейлист"),
                    CreatedAt = pl.CreatedAt,
                    TrackCount = trackCount,
                    CoverUrl = coverUrl
                });
            }
            return result;
        }

        public async Task<PlaylistResponseDto> CreatePlaylistAsync(int userId, string name, CancellationToken ct = default)
        {
            var user = await _userRepository.GetUserById(userId);
            if (user == null)
                throw new Exception("User not found");

            const int userPlaylistTypeId = 2; // тип "Пользовательский"
            var playlist = await _playlistRepository.CreatePlaylist(userId, name, userPlaylistTypeId, ct);

            return new PlaylistResponseDto
            {
                TypeId = playlist.TypeId,
                UserId = playlist.UserId,
                PlaylistId = playlist.PlaylistId,
                Name = playlist.Name,
                TypeName = "Плейлист",
                CreatedAt = playlist.CreatedAt,
                TrackCount = 0,
                CoverUrl = null
            };
        }

        public async Task DeletePlaylistAsync(int typeId, int userId, int playlistId, CancellationToken ct = default)
        {
            var playlist = await _playlistRepository.GetPlaylistById(typeId, userId, playlistId, ct);
            if (playlist == null)
                throw new Exception("Playlist not found");

            if (typeId == 1) // системный плейлист (избранное) нельзя удалить
                throw new Exception("Cannot delete system playlist");

            await _playlistRepository.DeletePlaylist(typeId, userId, playlistId, ct);
        }

        public async Task<(List<TrackResponseDto> Items, int TotalCount)> GetPlaylistTracksAsync(
            int typeId, int userId, int playlistId, int page, int pageSize, CancellationToken ct = default)
        {
            var playlist = await _playlistRepository.GetPlaylistById(typeId, userId, playlistId, ct);
            if (playlist == null)
                throw new Exception("Playlist not found");

            var tracks = await _playlistRepository.GetPlaylistTracks(typeId, userId, playlistId, page, pageSize, ct);
            var total = await _playlistRepository.GetPlaylistTracksCount(typeId, userId, playlistId, ct);

            var trackDtos = tracks.Select(t => MapToTrackResponseDto(t)).ToList();
            return (trackDtos, total);
        }

        public async Task AddTrackToPlaylistAsync(int typeId, int userId, int playlistId, int trackId, CancellationToken ct = default)
        {
            var playlist = await _playlistRepository.GetPlaylistById(typeId, userId, playlistId, ct);
            if (playlist == null)
                throw new Exception("Playlist not found");

            var track = await _trackRepository.GetTrackById(trackId, ct);
            if (track == null)
                throw new Exception("Track not found");

            // Проверка, не добавлен ли уже трек
            var existing = await _playlistRepository.GetPlaylistTracks(typeId, userId, playlistId, 1, 1, ct);
            if (existing.Any(t => t.TrackId == trackId))
                throw new Exception("Track already in playlist");

            await _playlistRepository.AddTrackToPlaylist(typeId, userId, playlistId, trackId, ct);
        }

        public async Task RemoveTrackFromPlaylistAsync(int typeId, int userId, int playlistId, int trackId, CancellationToken ct = default)
        {
            var playlist = await _playlistRepository.GetPlaylistById(typeId, userId, playlistId, ct);
            if (playlist == null)
                throw new Exception("Playlist not found");

            await _playlistRepository.RemoveTrackFromPlaylist(typeId, userId, playlistId, trackId, ct);
        }

        private TrackResponseDto MapToTrackResponseDto(Track track)
        {
            return new TrackResponseDto
            {
                TrackId = track.TrackId,
                Name = track.Name,
                Duration = track.Duration,
                ReleaseDate = track.ReleaseDate,
                TrackUrl = track.TrackLink,
                CoverUrl = track.CoverLink,
                Artists = track.ArtistTracks?.Select(at => new ArtistBriefDto
                {
                    ArtistId = at.ArtistId,
                    Name = at.Artist?.Name ?? ""
                }).ToList() ?? new List<ArtistBriefDto>(),
                Genres = track.TrackGenres?.Select(tg => tg.Genre?.Name ?? "").ToList() ?? new List<string>()
            };
        }
    }
}