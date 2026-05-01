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
    public class AlbumRepository : IAlbumRepository
    {
        private readonly AppDbContext _context;

        public AlbumRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Album?> GetAlbumAsync(int artistId, int albumId, CancellationToken ct = default)
        {
            return await _context.Albums
                .FirstOrDefaultAsync(a => a.ArtistId == artistId && a.AlbumId == albumId, ct);
        }

        public async Task<Album?> GetAlbumWithDetailsAsync(int artistId, int albumId, CancellationToken ct = default)
        {
            return await _context.Albums
                .Include(a => a.Artist)
                .Include(a => a.AlbumTracks)
                    .ThenInclude(at => at.Track)
                .FirstOrDefaultAsync(a => a.ArtistId == artistId && a.AlbumId == albumId, ct);
        }

        public async Task<List<Album>> GetAlbumsByArtistAsync(int artistId, int page, int pageSize, CancellationToken ct = default)
        {
            return await _context.Albums
                .Where(a => a.ArtistId == artistId)
                .OrderByDescending(a => a.ReleaseDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);
        }

        public async Task<int> GetNextAlbumIdAsync(int artistId, CancellationToken ct = default)
        {
            var maxId = await _context.Albums
                .Where(a => a.ArtistId == artistId)
                .MaxAsync(a => (int?)a.AlbumId, ct);
            return (maxId ?? 0) + 1;
        }

        public async Task CreateAlbumAsync(Album album, CancellationToken ct = default)
        {
            album.AlbumId = await GetNextAlbumIdAsync(album.ArtistId, ct);
            await _context.Albums.AddAsync(album, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task UpdateAlbumAsync(Album album, CancellationToken ct = default)
        {
            _context.Albums.Update(album);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteAlbumAsync(int artistId, int albumId, CancellationToken ct = default)
        {
            var album = await GetAlbumAsync(artistId, albumId, ct);
            if (album != null)
            {
                _context.Albums.Remove(album);
                await _context.SaveChangesAsync(ct);
            }
        }

        public async Task AddTracksToAlbumAsync(int artistId, int albumId, List<int> trackIds, CancellationToken ct = default)
        {
            var existing = await _context.AlbumTracks
                .Where(at => at.ArtistId == artistId && at.AlbumId == albumId && trackIds.Contains(at.TrackId))
                .Select(at => at.TrackId)
                .ToListAsync(ct);

            var newTrackIds = trackIds.Except(existing).ToList();
            if (!newTrackIds.Any()) return;

            var albumTracks = newTrackIds.Select(trackId => new AlbumTrack
            {
                ArtistId = artistId,
                AlbumId = albumId,
                TrackId = trackId
            });

            await _context.AlbumTracks.AddRangeAsync(albumTracks, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task RemoveTracksFromAlbumAsync(int artistId, int albumId, List<int> trackIds, CancellationToken ct = default)
        {
            var toRemove = await _context.AlbumTracks
                .Where(at => at.ArtistId == artistId && at.AlbumId == albumId && trackIds.Contains(at.TrackId))
                .ToListAsync(ct);

            _context.AlbumTracks.RemoveRange(toRemove);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<bool> IsTrackInAlbumAsync(int artistId, int albumId, int trackId, CancellationToken ct = default)
        {
            return await _context.AlbumTracks
                .AnyAsync(at => at.ArtistId == artistId && at.AlbumId == albumId && at.TrackId == trackId, ct);
        }

        public async Task<int> GetTracksCountAsync(int artistId, int albumId, CancellationToken ct = default)
        {
            return await _context.AlbumTracks
                .CountAsync(at => at.ArtistId == artistId && at.AlbumId == albumId, ct);
        }

        public async Task AddToFavoritesAsync(int userId, int artistId, int albumId, CancellationToken ct = default)
        {
            var userAlbum = new UserAlbum
            {
                UserId = userId,
                ArtistId = artistId,
                AlbumId = albumId
            };
            await _context.UserAlbums.AddAsync(userAlbum, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task RemoveFromFavoritesAsync(int userId, int artistId, int albumId, CancellationToken ct = default)
        {
            var entry = await _context.UserAlbums
                .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.ArtistId == artistId && ua.AlbumId == albumId, ct);
            if (entry != null)
            {
                _context.UserAlbums.Remove(entry);
                await _context.SaveChangesAsync(ct);
            }
        }

        public async Task<bool> IsAlbumInFavoritesAsync(int userId, int artistId, int albumId, CancellationToken ct = default)
        {
            return await _context.UserAlbums
                .AnyAsync(ua => ua.UserId == userId && ua.ArtistId == artistId && ua.AlbumId == albumId, ct);
        }

        public async Task<(List<Album> Albums, int TotalCount)> GetFavoriteAlbumsAsync(int userId, int page, int pageSize, CancellationToken ct = default)
        {
            var query = _context.UserAlbums
                .Where(ua => ua.UserId == userId)
                .Join(_context.Albums,
                    ua => new { ua.ArtistId, ua.AlbumId },
                    a => new { a.ArtistId, a.AlbumId },
                    (ua, a) => a)
                .Include(a => a.Artist);

            var totalCount = await query.CountAsync(ct);
            var albums = await query
                .OrderByDescending(a => a.ReleaseDate)  // сортировка на усмотрение
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (albums, totalCount);
        }
    }
}
