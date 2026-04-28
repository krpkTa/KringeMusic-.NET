using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IRecordLabelRepository
    {
        Task<bool> ExistsById(int labelId, CancellationToken ct);
        Task<RecordLabel?> GetById(int labelId, CancellationToken ct);
        Task<RecordLabel?> GetByName(string name, CancellationToken ct);
        Task<bool> ExistsByName(string name, CancellationToken ct);
        Task<RecordLabel?> GetByIdWithArtists(int id, CancellationToken ct);
        Task<int> GetArtistsCount(int labelId, CancellationToken ct);
        Task<List<RecordLabel>> GetPaginatedAsync(string? search, int page, int pageSize, CancellationToken ct);
        Task CreateAsync(RecordLabel label, CancellationToken ct);
        Task UpdateAsync(RecordLabel label, CancellationToken ct);
        Task DeleteAsync(RecordLabel label, CancellationToken ct);
    }
}
