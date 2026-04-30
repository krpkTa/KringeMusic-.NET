using Application.DTOs.UserPreferences;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application
{
    public class UserPreferencesService
    {
        private readonly IUserPreferencesRepository _preferencesRepository;
        private readonly IGenreRepository _genreRepository;
        private readonly IArtistRepository _artistRepository;

        public UserPreferencesService(
            IUserPreferencesRepository preferencesRepo,
            IGenreRepository genreRepo,
            IArtistRepository artistRepo)
        {
            _preferencesRepository = preferencesRepo;
            _genreRepository = genreRepo;
            _artistRepository = artistRepo;
        }

        public async Task SavePreferencesAsync(int userId, UserPreferencesRequestDto dto, CancellationToken ct = default)
        {
            if (dto.GenreIds.Any())
            {
                foreach (var genreId in dto.GenreIds)
                {
                    if (!await _genreRepository.ExistsById(genreId, ct))
                        throw new Exception($"Жанр с ID {genreId} не найден.");
                }
            }

            if (dto.ArtistIds.Any())
            {
                foreach (var artistId in dto.ArtistIds)
                {
                    if (!await _artistRepository.ExistsById(artistId, ct))
                        throw new Exception($"Артист с ID {artistId} не найден.");
                }
            }

            await _preferencesRepository.RemoveAllGenresFromUserAsync(userId, ct);
            if (dto.GenreIds.Any())
                await _preferencesRepository.AddGenresToUserAsync(userId, dto.GenreIds, ct);

            await _preferencesRepository.RemoveAllArtistsFromUserAsync(userId, ct);
            if (dto.ArtistIds.Any())
                await _preferencesRepository.AddArtistsToUserAsync(userId, dto.ArtistIds, ct);
        }

        public async Task<UserPreferencesResponseDto> GetPreferencesAsync(int userId, CancellationToken ct = default)
        {
            var genreIds = await _preferencesRepository.GetUserGenreIdsAsync(userId, ct);
            var artistIds = await _preferencesRepository.GetUserArtistIdsAsync(userId, ct);
            return new UserPreferencesResponseDto
            {
                GenreIds = genreIds,
                ArtistIds = artistIds
            };
        }
    }
}
