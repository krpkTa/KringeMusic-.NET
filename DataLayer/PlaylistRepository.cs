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
    public class PlaylistRepository : IPlaylistRepository
    {
        private readonly AppDbContext _context;
        private const int SystemPlaylistTypeId = 1;

        public PlaylistRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Playlist?> GetSystemFavoritesPlaylist(int userId, CancellationToken ct = default)
        {
            return await _context.Playlists
                .FirstOrDefaultAsync(p => p.TypeId == SystemPlaylistTypeId && p.UserId == userId, ct);
        }

        public async Task<Playlist> CreateSystemPlaylist(int userId, string name, CancellationToken ct = default)
        {
            
            var maxId = await _context.Playlists
                .Where(p => p.UserId == userId)
                .MaxAsync(p => (int?)p.PlaylistId, ct) ?? 0;
            var playlist = new Playlist
            {
                TypeId = SystemPlaylistTypeId,
                UserId = userId,
                PlaylistId = maxId + 1,
                Name = name,
                CreatedAt = DateTime.UtcNow
            };
            _context.Playlists.Add(playlist);
            await _context.SaveChangesAsync(ct);
            return playlist;
        }

        public async Task<bool> IsTrackInFavorites(int userId, int trackId, CancellationToken ct = default)
        {
            return await _context.PlaylistTracks
                .AnyAsync(pt => pt.TypeId == SystemPlaylistTypeId && pt.UserId == userId && pt.TrackId == trackId, ct);
        }

        public async Task AddTrackToPlaylist(int typeId, int userId, int playlistId, int trackId, CancellationToken ct = default)
        {
            var playlistTrack = new PlaylistTrack
            {
                TypeId = typeId,
                UserId = userId,
                PlaylistId = playlistId,
                TrackId = trackId,
                AddedAt = DateTime.UtcNow
            };
            _context.PlaylistTracks.Add(playlistTrack);
            await _context.SaveChangesAsync(ct);
        }

        public async Task RemoveTrackFromPlaylist(int typeId, int userId, int playlistId, int trackId, CancellationToken ct = default)
        {
            var entity = await _context.PlaylistTracks
                .FirstOrDefaultAsync(pt => pt.TypeId == typeId && pt.UserId == userId && pt.PlaylistId == playlistId && pt.TrackId == trackId, ct);
            if (entity != null)
            {
                _context.PlaylistTracks.Remove(entity);
                await _context.SaveChangesAsync(ct);
            }
        }

        public async Task<List<Track>> GetFavoriteTracks(int userId, int page, int pageSize, CancellationToken ct = default)
        {
            return await _context.PlaylistTracks
                .Where(pt => pt.TypeId == SystemPlaylistTypeId && pt.UserId == userId)
                .OrderByDescending(pt => pt.AddedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(pt => pt.Track!)
                .AsNoTracking()
                .ToListAsync(ct);
        }

        public async Task<int> GetFavoriteTracksCount(int userId, CancellationToken ct = default)
        {
            return await _context.PlaylistTracks
                .CountAsync(pt => pt.TypeId == SystemPlaylistTypeId && pt.UserId == userId, ct);
        }

        public async Task<List<Playlist>> GetUserPlaylists(int userId, CancellationToken ct = default)
        {
            return await _context.Playlists
                .Where(p => p.UserId == userId)
                .OrderBy(p => p.TypeId) 
                .ThenBy(p => p.CreatedAt)
                .Include(p => p.Type)
                .ToListAsync(ct);
        }

        public async Task<Playlist?> GetPlaylistById(int typeId, int userId, int playlistId, CancellationToken ct = default)
        {
            return await _context.Playlists
                .FirstOrDefaultAsync(p => p.TypeId == typeId && p.UserId == userId && p.PlaylistId == playlistId, ct);
        }

        public async Task<Playlist> CreatePlaylist(int userId, string name, int typeId, CancellationToken ct = default)
        {
            var maxId = await _context.Playlists
                .Where(p => p.UserId == userId && p.TypeId == typeId)
                .MaxAsync(p => (int?)p.PlaylistId, ct) ?? 0;

            var playlist = new Playlist
            {
                TypeId = typeId,
                UserId = userId,
                PlaylistId = maxId + 1,
                Name = name,
                CreatedAt = DateTime.UtcNow
            };
            _context.Playlists.Add(playlist);
            await _context.SaveChangesAsync(ct);
            return playlist;
        }

        public async Task DeletePlaylist(int typeId, int userId, int playlistId, CancellationToken ct = default)
        {
            var playlist = await GetPlaylistById(typeId, userId, playlistId, ct);
            if (playlist != null)
            {
                var tracks = _context.PlaylistTracks.Where(pt =>
                    pt.TypeId == typeId && pt.UserId == userId && pt.PlaylistId == playlistId);
                _context.PlaylistTracks.RemoveRange(tracks);
                _context.Playlists.Remove(playlist);
                await _context.SaveChangesAsync(ct);
            }
        }

        public async Task<List<Track>> GetPlaylistTracks(int typeId, int userId, int playlistId, int page, int pageSize, CancellationToken ct = default)
        {
            return await _context.PlaylistTracks
                .Where(pt => pt.TypeId == typeId && pt.UserId == userId && pt.PlaylistId == playlistId)
                .OrderByDescending(pt => pt.AddedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(pt => pt.Track)               
                    .ThenInclude(t => t.ArtistTracks)
                        .ThenInclude(at => at.Artist)
                .Select(pt => pt.Track!)            
                .AsNoTracking()
                .ToListAsync(ct);
        }

        public async Task<int> GetPlaylistTracksCount(int typeId, int userId, int playlistId, CancellationToken ct = default)
        {
            return await _context.PlaylistTracks
                .CountAsync(pt => pt.TypeId == typeId && pt.UserId == userId && pt.PlaylistId == playlistId, ct);
        }
    }
}

