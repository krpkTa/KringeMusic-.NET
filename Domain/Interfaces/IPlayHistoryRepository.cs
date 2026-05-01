using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IPlayHistoryRepository
    {
        Task AddHistoryAsync(PlayedHistory history, CancellationToken ct = default);
        Task<(List<PlayedHistory> Items, int TotalCount)> GetUserHistoryAsync(int userId, int page, int pageSize, CancellationToken ct = default);
        Task<HashSet<int>> GetRecentlyPlayedTrackIds(int userId, TimeSpan period, CancellationToken ct);
    }
}
