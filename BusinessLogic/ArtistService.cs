using Domain;
using Domain.Interfaces;
using KringeMusic.DTOs.Artist;
using Microsoft.AspNetCore.Http;

namespace Application
{
    public class ArtistService
    {
        private readonly IArtistRepository _artistRepository;
        private readonly IRecordLabelRepository _labelRepository;
        private readonly IStorageService _storage;

        public ArtistService(
            IArtistRepository artistRepository,
            IRecordLabelRepository labelRepository,
            IStorageService storageService)
        {
            _artistRepository = artistRepository;
            _labelRepository = labelRepository;
            _storage = storageService;
        }

        public async Task<ArtistResponseDto> CreateAsync(string name, string description, int? labelId, CancellationToken ct = default)
        {
            var existing = await _artistRepository.GetArtistByName(name, ct);
            if (existing != null)
                throw new Exception($"Артист с именем '{name}' уже существует.");

            if (labelId.HasValue && !await _labelRepository.ExistsById(labelId.Value, ct))
                throw new Exception($"Лейбл с ID {labelId} не найден.");

            var artist = new Artist
            {
                Name = name,
                Description = description,
                LabelId = labelId,
                CoverLink = null
            };

            await _artistRepository.CreateArtist(artist, ct);
            return await MapToResponseAsync(artist, ct);
        }

        public async Task<ArtistResponseDto> UpdateAsync(int artistId, string name, string description, int? labelId, IFormFile? coverFile, CancellationToken ct = default)
        {
            var artist = await _artistRepository.GetArtistById(artistId, ct);
            if (artist == null)
                throw new Exception($"Артист с ID {artistId} не найден.");

            var duplicate = await _artistRepository.GetArtistByName(name, ct);
            if (duplicate != null && duplicate.ArtistId != artistId)
                throw new Exception($"Артист с именем '{name}' уже существует.");

            if (labelId.HasValue && !await _labelRepository.ExistsById(labelId.Value, ct))
                throw new Exception($"Лейбл с ID {labelId} не найден.");

            artist.Name = name;
            artist.Description = description;
            artist.LabelId = labelId;

            if (coverFile is { Length: > 0 })
            {
                if (!string.IsNullOrEmpty(artist.CoverLink))
                    await _storage.DeleteFileAsync(artist.CoverLink, ct);

                await using var stream = coverFile.OpenReadStream();
                var newPath = await _storage.UploadFileAsync(stream, coverFile.FileName, "artists", ct);
                artist.CoverLink = newPath;
            }

            await _artistRepository.UpdateArtist(artist, ct);
            return await MapToResponseAsync(artist, ct);
        }

        public async Task DeleteAsync(int artistId, CancellationToken ct = default)
        {
            var artist = await _artistRepository.GetArtistById(artistId, ct);
            if (artist == null)
                throw new Exception($"Артист с ID {artistId} не найден.");

            if (!string.IsNullOrEmpty(artist.CoverLink))
                await _storage.DeleteFileAsync(artist.CoverLink, ct);

            await _artistRepository.DeleteArtist(artistId, ct);
        }

        public async Task<ArtistResponseDto?> GetByIdAsync(int artistId, CancellationToken ct = default)
        {
            var artist = await _artistRepository.GetArtistByIdWithLabel(artistId, ct);
            return artist == null ? null : await MapToResponseAsync(artist, ct);
        }

        public async Task<List<ArtistResponseDto>> GetAllAsync(string? search = null, int page = 1, int pageSize = 10, CancellationToken ct = default)
        {
            var artists = await _artistRepository.GetArtistsPaginated(search, page, pageSize, ct);
            var result = new List<ArtistResponseDto>();
            foreach (var artist in artists)
                result.Add(await MapToResponseAsync(artist, ct));
            return result;
        }

        private async Task<ArtistResponseDto> MapToResponseAsync(Artist artist, CancellationToken ct)
        {
            // var tracksCount = await _artistRepository.GetTracksCountByArtistId(artist.ArtistId, ct);
            return new ArtistResponseDto
            {
                ArtistId = artist.ArtistId,
                Name = artist.Name,
                Description = artist.Description,
                CoverUrl = artist.CoverLink,
                LabelName = artist.Label?.Name,
                // TracksCount = tracksCount
            };
        }
    }
}