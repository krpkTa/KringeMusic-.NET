using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Track
{
    public class FavoriteTrackResponseDto
    {
        public int TrackId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Duration { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string? CoverLink { get; set; }
        public string? TrackLink { get; set; }
        public DateTime? AddedAt { get; set; }
    }
}
