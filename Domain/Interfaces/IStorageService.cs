using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IStorageService
    {
        Task<string> UploadFileAsync(Stream fileStream, string fileName, string subFolder, CancellationToken ct = default);
        Task DeleteFileAsync(string filePath, CancellationToken ct = default);
    }
}
