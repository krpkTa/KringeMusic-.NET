using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface ISearchRepository
    {
        Task<List<Track>> SearchTracksAsync(string searchTerm, int page, int pageSize, CancellationToken ct = default);
        Task<List<Artist>> SearchArtistsAsync(string searchTerm, int page, int pageSize, CancellationToken ct = default);
    }
}
