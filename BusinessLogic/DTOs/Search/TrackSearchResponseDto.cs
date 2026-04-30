
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Search
{
    public class TrackSearchResponseDto
    {
        public int TrackId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Duration { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string? CoverUrl { get; set; }
        public string? TrackUrl { get; set; }
        public List<string> Artists { get; set; } = new();
        public List<string> Genres { get; set; } = new();
    }
}
