using Application.DTOs.Album;
using Domain;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application
{
    public class AlbumService
    {
        private readonly IAlbumRepository _albumRepository;
        private readonly IArtistRepository _artistRepository;
        private readonly ITrackRepository _trackRepository;
        private readonly IStorageService _storage;

        public AlbumService(
            IAlbumRepository albumRepository,
            IArtistRepository artistRepository,
            ITrackRepository trackRepository,
            IStorageService storage)
        {
            _albumRepository = albumRepository;
            _artistRepository = artistRepository;
            _trackRepository = trackRepository;
            _storage = storage;
        }

        public async Task<AlbumResponseDto> CreateAsync(AlbumCreateDto dto, CancellationToken ct = default)
        {
            // Проверка существования артиста
            var artist = await _artistRepository.GetArtistById(dto.ArtistId, ct);
            if (artist == null)
                throw new Exception($"Artist with ID {dto.ArtistId} not found");

            // Проверка уникальности названия альбома у этого артиста (опционально)
            // Можно добавить проверку через репозиторий.

            var album = new Album
            {
                ArtistId = dto.ArtistId,
                Name = dto.Name,
                ReleaseDate = dto.ReleaseDate,
                CoverLink = null
            };

            // Загрузка обложки в storage (как у артистов)
            if (dto.CoverFile is { Length: > 0 })
            {
                await using var stream = dto.CoverFile.OpenReadStream();
                var path = await _storage.UploadFileAsync(stream, dto.CoverFile.FileName, "albums", ct);
                album.CoverLink = path;
            }

            await _albumRepository.CreateAlbumAsync(album, ct);

            // Добавление треков, если переданы
            if (dto.TrackIds.Any())
            {
                // Проверяем, что все треки существуют
                foreach (var trackId in dto.TrackIds)
                {
                    if (!await _trackRepository.ExistsAsync(trackId, ct))
                        throw new Exception($"Track with ID {trackId} not found");
                }
                await _albumRepository.AddTracksToAlbumAsync(album.ArtistId, album.AlbumId, dto.TrackIds, ct);
            }

            var created = await _albumRepository.GetAlbumWithDetailsAsync(album.ArtistId, album.AlbumId, ct);
            return MapToResponse(created!);
        }

        public async Task<AlbumResponseDto> UpdateAsync(AlbumUpdateDto dto, CancellationToken ct = default)
        {
            var album = await _albumRepository.GetAlbumAsync(dto.ArtistId, dto.AlbumId, ct);
            if (album == null)
                throw new Exception($"Album not found (ArtistId={dto.ArtistId}, AlbumId={dto.AlbumId})");

            album.Name = dto.Name;
            album.ReleaseDate = dto.ReleaseDate;

            if (dto.CoverFile is { Length: > 0 })
            {
                if (!string.IsNullOrEmpty(album.CoverLink))
                    await _storage.DeleteFileAsync(album.CoverLink, ct);

                await using var stream = dto.CoverFile.OpenReadStream();
                var newPath = await _storage.UploadFileAsync(stream, dto.CoverFile.FileName, "albums", ct);
                album.CoverLink = newPath;
            }

            await _albumRepository.UpdateAlbumAsync(album, ct);

            var updated = await _albumRepository.GetAlbumWithDetailsAsync(album.ArtistId, album.AlbumId, ct);
            return MapToResponse(updated!);
        }

        public async Task DeleteAsync(int artistId, int albumId, CancellationToken ct = default)
        {
            var album = await _albumRepository.GetAlbumAsync(artistId, albumId, ct);
            if (album == null)
                throw new Exception($"Album not found");

            if (!string.IsNullOrEmpty(album.CoverLink))
                await _storage.DeleteFileAsync(album.CoverLink, ct);

            await _albumRepository.DeleteAlbumAsync(artistId, albumId, ct);
        }

        public async Task<AlbumResponseDto?> GetByIdAsync(int artistId, int albumId, CancellationToken ct = default)
        {
            var album = await _albumRepository.GetAlbumWithDetailsAsync(artistId, albumId, ct);
            return album == null ? null : MapToResponse(album);
        }

        public async Task<List<AlbumResponseDto>> GetArtistAlbumsAsync(int artistId, int page = 1, int pageSize = 10, CancellationToken ct = default)
        {
            var artist = await _artistRepository.GetArtistById(artistId, ct);
            if (artist == null)
                throw new Exception($"Artist with ID {artistId} not found");

            var albums = await _albumRepository.GetAlbumsByArtistAsync(artistId, page, pageSize, ct);
            var result = new List<AlbumResponseDto>();
            foreach (var album in albums)
            {
                var tracksCount = await _albumRepository.GetTracksCountAsync(album.ArtistId, album.AlbumId, ct);
                result.Add(new AlbumResponseDto
                {
                    ArtistId = album.ArtistId,
                    AlbumId = album.AlbumId,
                    Name = album.Name,
                    ArtistName = artist.Name,
                    ReleaseDate = album.ReleaseDate,
                    CoverUrl = album.CoverLink,
                    TracksCount = tracksCount,
                    Tracks = new List<TrackBriefDto>()
                });
            }
            return result;
        }

        public async Task AddTracksToAlbumAsync(int artistId, int albumId, AddTrackToAlbumDto dto, CancellationToken ct = default)
        {
            var album = await _albumRepository.GetAlbumAsync(artistId, albumId, ct);
            if (album == null)
                throw new Exception($"Album not found");

            foreach (var trackId in dto.TrackIds)
            {
                if (!await _trackRepository.ExistsAsync(trackId, ct))
                    throw new Exception($"Track with ID {trackId} not found");
            }

            await _albumRepository.AddTracksToAlbumAsync(artistId, albumId, dto.TrackIds, ct);
        }

        public async Task RemoveTracksFromAlbumAsync(int artistId, int albumId, AddTrackToAlbumDto dto, CancellationToken ct = default)
        {
            var album = await _albumRepository.GetAlbumAsync(artistId, albumId, ct);
            if (album == null)
                throw new Exception($"Album not found");

            await _albumRepository.RemoveTracksFromAlbumAsync(artistId, albumId, dto.TrackIds, ct);
        }

        private AlbumResponseDto MapToResponse(Album album)
        {
            return new AlbumResponseDto
            {
                ArtistId = album.ArtistId,
                AlbumId = album.AlbumId,
                Name = album.Name,
                ArtistName = album.Artist?.Name ?? string.Empty,
                ReleaseDate = album.ReleaseDate,
                CoverUrl = album.CoverLink,
                TracksCount = album.AlbumTracks?.Count ?? 0,
                Tracks = album.AlbumTracks?.Select(at => new TrackBriefDto
                {
                    TrackId = at.TrackId,
                    Name = at.Track?.Name ?? string.Empty,
                    Duration = at.Track?.Duration ?? 0
                }).ToList() ?? new()
            };
        }
    }
}
