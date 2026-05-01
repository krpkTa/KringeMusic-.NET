using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Album
{
    public class FavoriteAlbumResponseDto
    {
        public int ArtistId { get; set; }
        public int AlbumId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ArtistName { get; set; } = string.Empty;
        public DateOnly ReleaseDate { get; set; }
        public string? CoverLink { get; set; }
    }
}
