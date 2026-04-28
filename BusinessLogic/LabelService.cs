using Application.DTOs.RecordLabel;
using DataLayer;
using Domain;
using Domain.Interfaces;
using KringeMusic.DTOs.RecordLabel;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application
{
    public class LabelService 
    {
        private readonly IRecordLabelRepository _repository;
        private readonly IStorageService _storage;

        public LabelService(AppDbContext db, IRecordLabelRepository repository, IStorageService storage)
        {
            _repository = repository;
            _storage = storage;
        }

        public async Task<LabelResponseDto> CreateAsync(string name, string country, IFormFile? logoFile, CancellationToken ct = default)
        {
            var exists = await _repository.ExistsByName(name, ct);

            if (exists)
                throw new Exception($"Лейбл с таким названием уже существует");

            var label = new RecordLabel
            {
                Name = name,
                Country = country,
            };

            if (logoFile is { Length: > 0 })
            {
                await using var stream = logoFile.OpenReadStream();
                var newPath = await _storage.UploadFileAsync(stream, logoFile.FileName, "labels", ct);
                label.CoverLink = newPath;
            }


            await _repository.CreateAsync(label, ct);
            return await MapToResponse(label, ct);
        }

        public async Task<LabelResponseDto> UpdateAsync(int labelId, string name, string country, IFormFile? coverFile, CancellationToken ct = default)
        {
            var label = await _repository.GetById(labelId, ct);

            if (label == null) throw new Exception($"Лейбл с ID {labelId} не найден.");

            label.Name = name;
            label.Country = country;

            if (coverFile is { Length: > 0 })
            {
                if (!string.IsNullOrEmpty(label.CoverLink))
                    await _storage.DeleteFileAsync(label.CoverLink, ct);

                await using var stream = coverFile.OpenReadStream();
                var newPath = await _storage.UploadFileAsync(stream, coverFile.FileName, "labels", ct);
                label.CoverLink = newPath;
            }

            await _repository.UpdateAsync(label, ct);
            return await MapToResponse(label, ct);
        }

        public async Task DeleteAsync(int labelId, CancellationToken ct = default)
        {
           var label = await _repository.GetByIdWithArtists(labelId, ct);

            if (label == null) throw new Exception($"Лейбл с ID {labelId} не найден.");

            if (label.Artists.Any())
                throw new InvalidOperationException($"Невозможно удалить лейбл, так как у него есть артисты. Сначала переназначьте или удалите их.");

            await _repository.DeleteAsync(label, ct);
        }

        public async Task<LabelResponseDto?> GetByIdAsync(int labelId, CancellationToken ct = default)
        {
            var label = await _repository.GetById(labelId, ct);

            return label == null ? null : await MapToResponse(label, ct);
        }

        public async Task<List<LabelResponseDto>> GetAllAsync(string? search = null, int page = 1, int pageSize = 10, CancellationToken ct = default)
        {
            var labels = await _repository.GetPaginatedAsync(search, page, pageSize, ct);

            var result = new List<LabelResponseDto>();
            foreach (var label in labels)
                result.Add(await MapToResponse(label, ct));

            return result;
        }

        private async Task<LabelResponseDto> MapToResponse(RecordLabel label, CancellationToken ct)
        {
            var artistsCount = await _repository.GetArtistsCount(label.LabelId, ct);
            return new LabelResponseDto
            {
                LabelId = label.LabelId,
                Name = label.Name,
                Country = label.Country,
                LogoUrl = label.CoverLink,
                ArtistsCount = artistsCount
            };
        }
    }
}
