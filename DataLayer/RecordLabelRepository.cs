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

    public class RecordLabelRepository : IRecordLabelRepository
    {
        private readonly AppDbContext _context;

        public RecordLabelRepository(AppDbContext context)
        {
            _context = context;
        }


        public async Task CreateAsync(RecordLabel label, CancellationToken ct)
        {
            _context.RecordLabels.Add(label);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(RecordLabel label, CancellationToken ct)
        {
            _context.RecordLabels.Remove(label);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<bool> ExistsById(int labelId, CancellationToken ct) => await _context.RecordLabels.AnyAsync(l => l.LabelId == labelId, ct);

        public async Task<bool> ExistsByName(string name, CancellationToken ct) => await (_context.RecordLabels.AnyAsync(l => l.Name == name, ct));

        public async Task<int> GetArtistsCount(int labelId, CancellationToken ct) => await _context.Artists.CountAsync(a => a.LabelId == labelId, ct);

        public async Task<RecordLabel?> GetById(int id, CancellationToken ct) => await _context.RecordLabels.FindAsync(new object[] { id }, ct);

        public async Task<RecordLabel?> GetByIdWithArtists(int id, CancellationToken ct) => await _context.RecordLabels.Include(l => l.Artists).FirstOrDefaultAsync(l => l.LabelId == id, ct);

        public async Task<RecordLabel?> GetByName(string name, CancellationToken ct) => await _context.RecordLabels.FirstOrDefaultAsync(l => l.Name == name, ct);

        public async Task<List<RecordLabel>> GetPaginatedAsync(string? search, int page, int pageSize, CancellationToken ct)
        {
            var query = _context.RecordLabels.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(l => l.Name.Contains(search));

            return await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        }

        public async Task UpdateAsync(RecordLabel label, CancellationToken ct)
        {
            _context.RecordLabels.Update(label);
            await _context.SaveChangesAsync();
        }
    }
}
