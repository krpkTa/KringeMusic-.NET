using Domain;
using Domain.Interfaces;
using KringeMusic.DTOs.Track;
using Microsoft.AspNetCore.Http;

namespace Application
{
    public class TrackService
    {
        private readonly ITrackRepository _repository;
        private readonly IStorageService _storage;

        public TrackService(ITrackRepository repository, IStorageService storage)
        {
            _repository = repository;
            _storage = storage;
        }

        public async Task<TrackResponseDto> CreateAsync(
            string name,
            int duration,
            DateTime releaseDate,
            IFormFile trackFile,
            IFormFile? coverFile,
            List<int> artistIds,
            List<bool> isPrimaryFlags,
            List<int> genreIds,
            CancellationToken ct = default)
        {

            if (artistIds == null || artistIds.Count == 0)
                throw new Exception("У трека должен быть хотя бы один исполнитель.");
            if (isPrimaryFlags == null || artistIds.Count != isPrimaryFlags.Count)
                throw new Exception("Количество флагов IsPrimary не соответствует количеству артистов.");
            if (isPrimaryFlags.Count(f => f) != 1)
                throw new Exception("Должен быть ровно один основной исполнитель (IsPrimary = true).");

            for (int i = 0; i < artistIds.Count; i++)
            {
                if (!await _repository.ExistsArtist(artistIds[i], ct))
                    throw new Exception($"Исполнитель с ID {artistIds[i]} не найден.");
            }

            if (genreIds != null)
            {
                foreach (var genreId in genreIds)
                {
                    if (!await _repository.ExistsGenre(genreId, ct))
                        throw new Exception($"Жанр с ID {genreId} не найден.");
                }
            }

            if (trackFile == null || trackFile.Length == 0)
                throw new Exception("Аудиофайл трека обязателен.");
            await using var trackStream = trackFile.OpenReadStream();
            var trackPath = await _storage.UploadFileAsync(trackStream, trackFile.FileName, "tracks", ct);

            string? coverPath = null;
            if (coverFile is { Length: > 0 })
            {
                await using var coverStream = coverFile.OpenReadStream();
                coverPath = await _storage.UploadFileAsync(coverStream, coverFile.FileName, "track_covers", ct);
            }

            var track = new Track
            {
                Name = name,
                Duration = duration,
                ReleaseDate = releaseDate,
                TrackLink = trackPath,
                CoverLink = coverPath
            };

            await _repository.CreateTrack(track, ct);

            for (int i = 0; i < artistIds.Count; i++)
                await _repository.AddArtistToTrack(track.TrackId, artistIds[i], isPrimaryFlags[i], ct);

            if (genreIds != null)
            {
                foreach (var genreId in genreIds)
                    await _repository.AddGenreToTrack(track.TrackId, genreId, ct);
            }

            return await MapToResponseAsync(track.TrackId, ct);
        }

        public async Task<TrackResponseDto> UpdateAsync(
            int trackId,
            string name,
            int duration,
            DateTime releaseDate,
            IFormFile? trackFile,
            IFormFile? coverFile,
            List<int> artistIds,
            List<bool> isPrimaryFlags,
            List<int> genreIds,
            CancellationToken ct = default)
        {
            var track = await _repository.GetTrackWithDetails(trackId, ct);
            if (track == null)
                throw new Exception($"Трек с ID {trackId} не найден.");

            if (artistIds == null || artistIds.Count == 0)
                throw new Exception("У трека должен быть хотя бы один исполнитель.");
            if (isPrimaryFlags == null || artistIds.Count != isPrimaryFlags.Count)
                throw new Exception("Количество флагов IsPrimary не соответствует количеству артистов.");
            if (isPrimaryFlags.Count(f => f) != 1)
                throw new Exception("Должен быть ровно один основной исполнитель (IsPrimary = true).");

            for (int i = 0; i < artistIds.Count; i++)
            {
                if (!await _repository.ExistsArtist(artistIds[i], ct))
                    throw new Exception($"Исполнитель с ID {artistIds[i]} не найден.");
            }

            if (genreIds != null)
            {
                foreach (var genreId in genreIds)
                {
                    if (!await _repository.ExistsGenre(genreId, ct))
                        throw new Exception($"Жанр с ID {genreId} не найден.");
                }
            }

            track.Name = name;
            track.Duration = duration;
            track.ReleaseDate = releaseDate;

            if (trackFile is { Length: > 0 })
            {
                if (!string.IsNullOrEmpty(track.TrackLink))
                    await _storage.DeleteFileAsync(track.TrackLink, ct);
                await using var stream = trackFile.OpenReadStream();
                track.TrackLink = await _storage.UploadFileAsync(stream, trackFile.FileName, "tracks", ct);
            }

            if (coverFile is { Length: > 0 })
            {
                if (!string.IsNullOrEmpty(track.CoverLink))
                    await _storage.DeleteFileAsync(track.CoverLink, ct);
                await using var stream = coverFile.OpenReadStream();
                track.CoverLink = await _storage.UploadFileAsync(stream, coverFile.FileName, "track_covers", ct);
            }

            await _repository.UpdateTrack(track, ct);

            await _repository.RemoveAllArtistsFromTrack(track.TrackId, ct);
            for (int i = 0; i < artistIds.Count; i++)
                await _repository.AddArtistToTrack(track.TrackId, artistIds[i], isPrimaryFlags[i], ct);

            await _repository.RemoveAllGenresFromTrack(track.TrackId, ct);
            if (genreIds != null)
            {
                foreach (var genreId in genreIds)
                    await _repository.AddGenreToTrack(track.TrackId, genreId, ct);
            }

            return await MapToResponseAsync(track.TrackId, ct);
        }

        public async Task DeleteAsync(int trackId, CancellationToken ct = default)
        {
            var track = await _repository.GetTrackById(trackId, ct);
            if (track == null)
                throw new Exception($"Трек с ID {trackId} не найден.");

            if (!string.IsNullOrEmpty(track.TrackLink))
                await _storage.DeleteFileAsync(track.TrackLink, ct);
            if (!string.IsNullOrEmpty(track.CoverLink))
                await _storage.DeleteFileAsync(track.CoverLink, ct);

            await _repository.DeleteTrack(trackId, ct);
        }

        public async Task<TrackResponseDto?> GetByIdAsync(int trackId, CancellationToken ct = default)
            => await MapToResponseAsync(trackId, ct);

        public async Task<List<TrackResponseDto>> GetAllAsync(string? search, int page, int pageSize, CancellationToken ct = default)
        {
            var tracks = await _repository.GetTracksPaginated(search, page, pageSize, ct);
            var result = new List<TrackResponseDto>();
            foreach (var track in tracks)
            {
                var fullTrack = await _repository.GetTrackWithDetails(track.TrackId, ct);
                if (fullTrack != null)
                    result.Add(MapToResponse(fullTrack));
            }
            return result;
        }

        private async Task<TrackResponseDto?> MapToResponseAsync(int trackId, CancellationToken ct)
        {
            var track = await _repository.GetTrackWithDetails(trackId, ct);
            return track == null ? null : MapToResponse(track);
        }

        private TrackResponseDto MapToResponse(Track track)
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
                    Name = at.Artist?.Name ?? string.Empty,
                    IsPrimary = at.IsPrimary
                }).ToList() ?? new List<ArtistBriefDto>(),
                Genres = track.TrackGenres?.Select(tg => tg.Genre?.Name ?? string.Empty)
                                 .Where(n => !string.IsNullOrEmpty(n))
                                 .ToList() ?? new List<string>()
            };
        }
    }
}