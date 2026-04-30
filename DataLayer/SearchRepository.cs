using Domain;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataLayer
{
    public class SearchRepository : ISearchRepository
    {
        private readonly AppDbContext _context;

        public SearchRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Track>> SearchTracksAsync(string searchTerm, int page, int pageSize, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return new List<Track>();

            var offset = (page - 1) * pageSize;

            var sql = @"
    SELECT 
        t.track_id,          -- вместо t.track_id AS TrackId
        t.name,
        t.duration,
        t.release_date,
        t.track_link,
        t.cover_link
    FROM track t
    WHERE 
        t.name ILIKE '%' || @SearchTerm || '%'
        OR EXISTS (
            SELECT 1
            FROM artist_tracks at
            JOIN artist a ON at.artist_id = a.artist_id
            WHERE at.track_id = t.track_id
              AND a.name ILIKE '%' || @SearchTerm || '%'
        )
    ORDER BY t.name
    LIMIT @PageSize OFFSET @Offset";

            var tracks = await _context.Tracks
                .FromSqlRaw(sql,
                    new NpgsqlParameter("@SearchTerm", searchTerm),
                    new NpgsqlParameter("@PageSize", pageSize),
                    new NpgsqlParameter("@Offset", offset))
                .ToListAsync(ct);

            if (!tracks.Any())
                return tracks;

            // Загружаем артистов для найденных треков
            var trackIds = tracks.Select(t => t.TrackId).ToList();
            var artistTracks = await _context.ArtistTracks
                .Include(at => at.Artist)
                .Where(at => trackIds.Contains(at.TrackId))
                .ToListAsync(ct);

            // Загружаем жанры для найденных треков
            var trackGenres = await _context.TrackGenres
                .Include(tg => tg.Genre)
                .Where(tg => trackIds.Contains(tg.TrackId))
                .ToListAsync(ct);

            // Привязываем данные к объектам Track (EF сделает это автоматически, т.к. контекст отслеживает)
            // Достаточно просто запросить – навигационные свойства заполнятся благодаря ChangeTracker.
            // Но чтобы быть уверенными, можно вручную:
            foreach (var track in tracks)
            {
                track.ArtistTracks = artistTracks.Where(at => at.TrackId == track.TrackId).ToList();
                track.TrackGenres = trackGenres.Where(tg => tg.TrackId == track.TrackId).ToList();
            }

            return tracks;
        }

        public async Task<List<Artist>> SearchArtistsAsync(string searchTerm, int page, int pageSize, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return new List<Artist>();

            var sql = @"
        SELECT 
            artist_id,
            name,
            cover_link,
            description,
            label_id
        FROM artist
        WHERE name ILIKE '%' || @SearchTerm || '%'
        ORDER BY name
        LIMIT @PageSize OFFSET @Offset";

            return await _context.Set<Artist>()
                .FromSqlRaw(sql,
                    new NpgsqlParameter("@SearchTerm", searchTerm),
                    new NpgsqlParameter("@PageSize", pageSize),
                    new NpgsqlParameter("@Offset", (page - 1) * pageSize))
                .ToListAsync(ct);
        }
    }
}
