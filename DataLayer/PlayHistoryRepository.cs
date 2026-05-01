using Domain;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataLayer
{
    public class PlayHistoryRepository : IPlayHistoryRepository
    {
        private readonly AppDbContext _context;

        public PlayHistoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddHistoryAsync(PlayedHistory history, CancellationToken ct = default)
        {
            await _context.PlayedHistory.AddAsync(history, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<(List<PlayedHistory> Items, int TotalCount)> GetUserHistoryAsync(
    int userId, int page, int pageSize, CancellationToken ct = default)
        {
            var query = _context.PlayedHistory
                .Where(h => h.UserId == userId)
                .OrderByDescending(h => h.ListeningDate);

            var totalCount = await query.CountAsync(ct);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(h => h.Track)
                    .ThenInclude(t => t.ArtistTracks)
                        .ThenInclude(at => at.Artist)
                .ToListAsync(ct);

            return (items, totalCount);
        }
    }
}
