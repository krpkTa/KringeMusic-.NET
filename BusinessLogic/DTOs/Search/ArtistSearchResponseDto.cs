using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Search
{
    public class ArtistSearchResponseDto
    {
        public int ArtistId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public string? Description { get; set; }
    }
}
