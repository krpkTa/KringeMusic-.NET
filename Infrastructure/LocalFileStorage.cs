using Domain.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
    public class LocalFileStorage : IStorageService
    {
        private readonly LocalStorageSettings _settings;
        private readonly IWebHostEnvironment _environment;

        public LocalFileStorage(IOptions<LocalStorageSettings> settings, IWebHostEnvironment environment)
        {
            _settings = settings.Value;
            _environment = environment;
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string subFolder, CancellationToken ct = default)
        {
            // Генерируем уникальное имя файла (сохраняем расширение)
            var extension = Path.GetExtension(fileName);
            var uniqueName = $"{Guid.NewGuid()}{extension}";

            // Формируем путь внутри папки uploads: uploads/artists/xxx.jpg
            var relativeDir = Path.Combine(_settings.BasePath, subFolder);
            var absoluteDir = Path.Combine(_environment.WebRootPath, relativeDir);

            if (!Directory.Exists(absoluteDir))
                Directory.CreateDirectory(absoluteDir);

            var relativeFilePath = Path.Combine(relativeDir, uniqueName).Replace("\\", "/");
            var absoluteFilePath = Path.Combine(_environment.WebRootPath, relativeFilePath);

            await using var fileStreamOutput = new FileStream(absoluteFilePath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true);
            await fileStream.CopyToAsync(fileStreamOutput, ct);

            // Возвращаем относительный путь для хранения в БД
            return $"/{relativeFilePath}"; // например /uploads/artists/id.jpg
        }

        public Task DeleteFileAsync(string filePath, CancellationToken ct = default)
        {
            if (string.IsNullOrEmpty(filePath)) return Task.CompletedTask;

            var absolutePath = Path.Combine(_environment.WebRootPath, filePath.TrimStart('/'));
            if (File.Exists(absolutePath))
            {
                File.Delete(absolutePath);
            }
            return Task.CompletedTask;
        }
    }

    public class LocalStorageSettings
    {
        public string BasePath { get; set; } = "wwwroot/uploads";
        public string BaseUrl { get; set; } = "/uploads";
    }
}
