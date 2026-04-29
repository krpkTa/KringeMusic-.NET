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
    public class TrackRepository : ITrackRepository
    {
        private readonly AppDbContext _context;
        public TrackRepository(AppDbContext appDbContext) => _context = appDbContext;
        public async Task<Track?> GetTrackById(int id, CancellationToken ct)
            => await _context.Tracks.FirstOrDefaultAsync(t => t.TrackId == id, ct);

        public async Task<Track?> GetTrackByName(string name, CancellationToken ct)
            => await _context.Tracks.FirstOrDefaultAsync(t => t.Name == name, ct);

        public async Task<Track?> GetTrackWithDetails(int id, CancellationToken ct)
        {
            return await _context.Tracks
                .Include(t => t.ArtistTracks)
                    .ThenInclude(at => at.Artist)
                .Include(t => t.TrackGenres)
                    .ThenInclude(tg => tg.Genre)
                .FirstOrDefaultAsync(t => t.TrackId == id, ct);
        }

        public async Task<List<Track>> GetTracksPaginated(string? search, int page, int pageSize, CancellationToken ct)
        {
            var query = _context.Tracks.AsNoTracking();
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(t => t.Name.Contains(search));
            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);
        }

        public async Task CreateTrack(Track track, CancellationToken ct)
        {
            _context.Tracks.Add(track);
            await _context.SaveChangesAsync(ct);
        }

        public async Task UpdateTrack(Track track, CancellationToken ct)
        {
            _context.Tracks.Update(track);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteTrack(int id, CancellationToken ct)
        {
            var track = await GetTrackById(id, ct);
            if (track != null)
            {
                _context.Tracks.Remove(track);
                await _context.SaveChangesAsync(ct);
            }
        }

        public async Task AddArtistToTrack(int trackId, int artistId, bool isPrimary, CancellationToken ct)
        {
            var artistTrack = new ArtistTrack
            {
                TrackId = trackId,
                ArtistId = artistId,
                IsPrimary = isPrimary
            };
            _context.ArtistTracks.Add(artistTrack);
            await _context.SaveChangesAsync(ct);
        }

        public async Task AddGenreToTrack(int trackId, int genreId, CancellationToken ct)
        {
            var trackGenre = new TrackGenre
            {
                TrackId = trackId,
                GenreId = genreId
            };
            _context.TrackGenres.Add(trackGenre);
            await _context.SaveChangesAsync(ct);
        }

        public async Task RemoveAllArtistsFromTrack(int trackId, CancellationToken ct)
        {
            var artists = _context.ArtistTracks.Where(at => at.TrackId == trackId);
            _context.ArtistTracks.RemoveRange(artists);
            await _context.SaveChangesAsync(ct);
        }

        public async Task RemoveAllGenresFromTrack(int trackId, CancellationToken ct)
        {
            var genres = _context.TrackGenres.Where(tg => tg.TrackId == trackId);
            _context.TrackGenres.RemoveRange(genres);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<bool> ExistsArtist(int artistId, CancellationToken ct)
            => await _context.Artists.AnyAsync(a => a.ArtistId == artistId, ct);

        public async Task<bool> ExistsGenre(int genreId, CancellationToken ct)
            => await _context.Genres.AnyAsync(g => g.GenreId == genreId, ct);
        public async Task<bool> ExistsAsync(int trackId, CancellationToken ct) => await _context.Tracks.AnyAsync(t => t.TrackId == trackId, ct);
    }
}
