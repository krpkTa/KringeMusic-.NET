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
    public class GenreRepository : IGenreRepository
    {
        private readonly AppDbContext _context;
        public GenreRepository(AppDbContext appDbContext) => _context = appDbContext;

        public async Task<Genre?> GetById(int id, CancellationToken ct)
            => await _context.Genres.FirstOrDefaultAsync(g => g.GenreId == id, ct);

        public async Task<Genre?> GetByName(string name, CancellationToken ct)
            => await _context.Genres.FirstOrDefaultAsync(g => g.Name == name, ct);

        public async Task<List<Genre>> GetAll(CancellationToken ct)
            => await _context.Genres.OrderBy(g => g.Name).ToListAsync(ct);

        public async Task<List<Genre>> GetPaginated(string? search, int page, int pageSize, CancellationToken ct)
        {
            var query = _context.Genres.AsNoTracking();
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(g => g.Name.Contains(search));
            return await query
                .OrderBy(g => g.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);
        }

        public async Task Create(Genre genre, CancellationToken ct)
        {
            _context.Genres.Add(genre);
            await _context.SaveChangesAsync(ct);
        }

        public async Task Update(Genre genre, CancellationToken ct)
        {
            _context.Genres.Update(genre);
            await _context.SaveChangesAsync(ct);
        }

        public async Task Delete(int id, CancellationToken ct)
        {
            var genre = await GetById(id, ct);
            if (genre != null)
            {
                _context.Genres.Remove(genre);
                await _context.SaveChangesAsync(ct);
            }
        }

        public async Task<bool> ExistsById(int id, CancellationToken ct)
            => await _context.Genres.AnyAsync(g => g.GenreId == id, ct);
    }
}
