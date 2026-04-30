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
    public class UserPreferencesRepository : IUserPreferencesRepository
    {
        private readonly AppDbContext _context;

        public UserPreferencesRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddGenresToUserAsync(int userId, List<int> genreIds, CancellationToken ct = default)
        {
            var existing = await _context.UserGenres
                .Where(ug => ug.UserId == userId && genreIds.Contains(ug.GenreId))
                .Select(ug => ug.GenreId)
                .ToListAsync(ct);

            var newGenres = genreIds.Except(existing).Select(gid => new UserGenre { UserId = userId, GenreId = gid });
            await _context.UserGenres.AddRangeAsync(newGenres, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task RemoveAllGenresFromUserAsync(int userId, CancellationToken ct = default)
        {
            var userGenres = _context.UserGenres.Where(ug => ug.UserId == userId);
            _context.UserGenres.RemoveRange(userGenres);
            await _context.SaveChangesAsync(ct);
        }

        public async Task AddArtistsToUserAsync(int userId, List<int> artistIds, CancellationToken ct = default)
        {
            var existing = await _context.UserArtists
                .Where(ua => ua.UserId == userId && artistIds.Contains(ua.ArtistId))
                .Select(ua => ua.ArtistId)
                .ToListAsync(ct);

            var newArtists = artistIds.Except(existing).Select(aid => new UserArtist { UserId = userId, ArtistId = aid });
            await _context.UserArtists.AddRangeAsync(newArtists, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task RemoveAllArtistsFromUserAsync(int userId, CancellationToken ct = default)
        {
            var userArtists = _context.UserArtists.Where(ua => ua.UserId == userId);
            _context.UserArtists.RemoveRange(userArtists);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<List<int>> GetUserGenreIdsAsync(int userId, CancellationToken ct = default)
        {
            return await _context.UserGenres
                .Where(ug => ug.UserId == userId)
                .Select(ug => ug.GenreId)
                .ToListAsync(ct);
        }

        public async Task<List<int>> GetUserArtistIdsAsync(int userId, CancellationToken ct = default)
        {
            return await _context.UserArtists
                .Where(ua => ua.UserId == userId)
                .Select(ua => ua.ArtistId)
                .ToListAsync(ct);
        }
    }
}
