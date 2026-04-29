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
    public class ArtistRepository : IArtistRepository
    {
        private readonly AppDbContext _context;

        public ArtistRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Artist> GetArtistById(int id, CancellationToken ct) => await _context.Artists.FirstOrDefaultAsync(a => a.ArtistId == id, ct);
        

        public async Task<Artist>? GetArtistByName(string name, CancellationToken ct) => await _context.Artists.FirstOrDefaultAsync(a => a.Name == name, ct);
        public async Task CreateArtist(Artist artist, CancellationToken ct)
        {
            _context.Artists.Add(artist);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<Artist?> GetArtistByIdWithLabel(int id, CancellationToken ct) => await _context.Artists.Include(a => a.Label).FirstOrDefaultAsync(a => a.ArtistId == id, ct);
        public async Task<List<Artist>> GetArtistsPaginated(string? search, int page, int pageSize, CancellationToken ct)
        {
            var query = _context.Artists
                .Include(a => a.Label)
                .Include(a => a.ArtistGenres)
                    .ThenInclude(ag => ag.Genre)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(a => a.Name.Contains(search) || (a.Description != null && a.Description.Contains(search)));

            return await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        }

        public async Task UpdateArtist(Artist artist, CancellationToken ct)
        {
            _context.Artists.Update(artist);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteArtist(int id, CancellationToken ct)
        {
            var artist = await GetArtistById(id, ct);
            if (artist != null)
            {
                _context.Artists.Remove(artist);
                await _context.SaveChangesAsync(ct);
            }
        }

        public async Task AddGenresToArtist(int artistId, List<int> genreIds, CancellationToken ct)
        {
            var artistGenres = genreIds.Select(gid => new ArtistGenre { ArtistId = artistId, GenreId = gid });
            await _context.ArtistGenres.AddRangeAsync(artistGenres, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task RemoveAllGenresFromArtist(int artistId, CancellationToken ct)
        {
            var genres = _context.ArtistGenres.Where(ag => ag.ArtistId == artistId);
            _context.ArtistGenres.RemoveRange(genres);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<Artist?> GetArtistWithDetails(int id, CancellationToken ct)
        {
            return await _context.Artists
                .Include(a => a.Label)
                .Include(a => a.ArtistGenres)
                    .ThenInclude(ag => ag.Genre)
                .FirstOrDefaultAsync(a => a.ArtistId == id, ct);
        }

        public async Task<int> GetTracksCountAsync(int artistId, CancellationToken ct = default)
        {
            return await _context.ArtistTracks.CountAsync(at => at.ArtistId == artistId, ct);
        }
    }
}
