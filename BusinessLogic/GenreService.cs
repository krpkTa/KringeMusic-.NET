using Application.DTOs.Genre;
using Domain;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application
{
    public class GenreService
    {
        private readonly IGenreRepository _genreRepository;
        public GenreService(IGenreRepository genreRepository) => _genreRepository = genreRepository;

        public async Task<GenreResponseDto> CreateAsync(string name, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new Exception("Название жанра не может быть пустым.");

            var existing = await _genreRepository.GetByName(name, ct);
            if (existing != null)
                throw new Exception($"Жанр с именем '{name}' уже существует.");

            var genre = new Genre { Name = name.Trim() };
            await _genreRepository.Create(genre, ct);
            return MapToResponse(genre);
        }

        public async Task<GenreResponseDto> UpdateAsync(int genreId, string name, CancellationToken ct = default)
        {
            var genre = await _genreRepository.GetById(genreId, ct);
            if (genre == null)
                throw new Exception($"Жанр с ID {genreId} не найден.");

            var duplicate = await _genreRepository.GetByName(name, ct);
            if (duplicate != null && duplicate.GenreId != genreId)
                throw new Exception($"Жанр с именем '{name}' уже существует.");

            genre.Name = name.Trim();
            await _genreRepository.Update(genre, ct);
            return MapToResponse(genre);
        }

        public async Task DeleteAsync(int genreId, CancellationToken ct = default)
        {
            var genre = await _genreRepository.GetById(genreId, ct);
            if (genre == null)
                throw new Exception($"Жанр с ID {genreId} не найден.");

            await _genreRepository.Delete(genreId, ct);
        }

        public async Task<GenreResponseDto?> GetByIdAsync(int genreId, CancellationToken ct = default)
        {
            var genre = await _genreRepository.GetById(genreId, ct);
            return genre == null ? null : MapToResponse(genre);
        }

        public async Task<List<GenreResponseDto>> GetAllAsync(CancellationToken ct = default)
        {
            var genres = await _genreRepository.GetAll(ct);
            return genres.Select(MapToResponse).ToList();
        }

        public async Task<List<GenreResponseDto>> GetPaginatedAsync(string? search, int page, int pageSize, CancellationToken ct = default)
        {
            var genres = await _genreRepository.GetPaginated(search, page, pageSize, ct);
            return genres.Select(MapToResponse).ToList();
        }

        private static GenreResponseDto MapToResponse(Genre genre)
            => new GenreResponseDto { GenreId = genre.GenreId, Name = genre.Name };
    }
}

