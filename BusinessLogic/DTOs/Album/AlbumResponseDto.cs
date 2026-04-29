using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Album
{
    public class AlbumResponseDto
    {
        public int ArtistId { get; set; }
        public int AlbumId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ArtistName { get; set; } = string.Empty;
        public DateOnly ReleaseDate { get; set; }
        public string? CoverUrl { get; set; }
        public int TracksCount { get; set; }
        public List<TrackBriefDto> Tracks { get; set; } = new();
    }

    public class TrackBriefDto
    {
        public int TrackId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Duration { get; set; }
    }
}
