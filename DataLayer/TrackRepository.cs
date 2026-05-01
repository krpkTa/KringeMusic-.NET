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
        public async Task<List<Track>> GetRecommendedTracks(List<int> genreIds, List<int> artistIds, int limit, CancellationToken ct = default)
        {
            // Если нет ни жанров, ни артистов – вернуть пустой список (или глобальный топ)
            if ((genreIds == null || !genreIds.Any()) && (artistIds == null || !artistIds.Any()))
                return new List<Track>();

            var query = _context.Tracks.AsQueryable();

            // Добавляем фильтрацию по жанрам через связанную таблицу track_genres
            if (genreIds != null && genreIds.Any())
            {
                query = query.Where(t => t.TrackGenres.Any(tg => genreIds.Contains(tg.GenreId)));
            }

            // Добавляем фильтрацию по артистам через artist_tracks
            if (artistIds != null && artistIds.Any())
            {
                // Нужно использовать OR для жанров и артистов, поэтому объединяем два набора через Union
                // Проще выполнить два отдельных запроса и объединить, но можно и Union в EF.
            }

            // Проще: получить треки, удовлетворяющие хотя бы одному условию – используем Union
            var byGenre = genreIds?.Any() == true
                ? _context.Tracks.Where(t => t.TrackGenres.Any(tg => genreIds.Contains(tg.GenreId)))
                : Enumerable.Empty<Track>().AsQueryable();

            var byArtist = artistIds?.Any() == true
                ? _context.Tracks.Where(t => t.ArtistTracks.Any(at => artistIds.Contains(at.ArtistId)))
                : Enumerable.Empty<Track>().AsQueryable();

            var combined = byGenre.Union(byArtist).Distinct();

            return await combined
                .OrderByDescending(t => t.Duration) // временно, позже заменим на popularity
                .Take(limit)
                .Include(t => t.ArtistTracks)
                    .ThenInclude(at => at.Artist)
                .AsNoTracking()
                .ToListAsync(ct);
        }

        public async Task<List<Track>> GetTopTracks(int limit, CancellationToken ct = default)
        {
            // Считаем количество прослушиваний каждого трека из истории и сортируем по убыванию
            var topTrackIds = await _context.PlayedHistory
                .GroupBy(h => h.TrackId)
                .Select(g => new { TrackId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(limit)
                .Select(x => x.TrackId)
                .ToListAsync(ct);

            var tracks = await _context.Tracks
                .Where(t => topTrackIds.Contains(t.TrackId))
                .Include(t => t.ArtistTracks)
                    .ThenInclude(at => at.Artist)
                .AsNoTracking()
                .ToListAsync(ct);

            // Сохраняем порядок из topTrackIds
            return topTrackIds.Select(id => tracks.FirstOrDefault(t => t.TrackId == id))
                              .Where(t => t != null)
                              .ToList()!;
        }
        public async Task<bool> ExistsArtist(int artistId, CancellationToken ct)
            => await _context.Artists.AnyAsync(a => a.ArtistId == artistId, ct);

        public async Task<bool> ExistsGenre(int genreId, CancellationToken ct)
            => await _context.Genres.AnyAsync(g => g.GenreId == genreId, ct);
        public async Task<bool> ExistsAsync(int trackId, CancellationToken ct) => await _context.Tracks.AnyAsync(t => t.TrackId == trackId, ct);
    }
}
