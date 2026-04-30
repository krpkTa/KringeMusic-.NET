using Application.DTOs.Search;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application
{
    public class SearchService
    {
        private readonly ISearchRepository _searchRepository;

        public SearchService(ISearchRepository searchRepository)
        {
            _searchRepository = searchRepository;
        }

        public async Task<List<TrackSearchResponseDto>> SearchTracksAsync(string query, int page = 1, int pageSize = 20, CancellationToken ct = default)
        {
            var tracks = await _searchRepository.SearchTracksAsync(query, page, pageSize, ct);
            return tracks.Select(t => new TrackSearchResponseDto
            {
                TrackId = t.TrackId,
                Name = t.Name,
                Duration = t.Duration,
                ReleaseDate = t.ReleaseDate,
                CoverUrl = t.CoverLink,
                TrackUrl = t.TrackLink,
                Artists = t.ArtistTracks?.Select(at => at.Artist?.Name ?? string.Empty).Where(n => !string.IsNullOrEmpty(n)).ToList() ?? new List<string>(),
                Genres = t.TrackGenres?.Select(tg => tg.Genre?.Name ?? string.Empty).Where(g => !string.IsNullOrEmpty(g)).ToList() ?? new List<string>()
            }).ToList();
        }
        public async Task<List<ArtistSearchResponseDto>> SearchArtistsAsync(string query, int page = 1, int pageSize = 10, CancellationToken ct = default)
        {
            var artists = await _searchRepository.SearchArtistsAsync(query, page, pageSize, ct);
            return artists.Select(a => new ArtistSearchResponseDto
            {
                ArtistId = a.ArtistId,
                Name = a.Name,
                CoverUrl = a.CoverLink,
                Description = a.Description
            }).ToList();
        }
    }
}
