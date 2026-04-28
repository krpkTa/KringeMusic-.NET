using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IGenreRepository
    {
        Task<Genre?> GetById(int id, CancellationToken ct);
        Task<Genre?> GetByName(string name, CancellationToken ct);
        Task<List<Genre>> GetAll(CancellationToken ct);
        Task<List<Genre>> GetPaginated(string? search, int page, int pageSize, CancellationToken ct);
        Task Create(Genre genre, CancellationToken ct);
        Task Update(Genre genre, CancellationToken ct);
        Task Delete(int id, CancellationToken ct);
        Task<bool> ExistsById(int id, CancellationToken ct);
    }
}
