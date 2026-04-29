using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Album
{
    public class AlbumCreateDto
    {
        public int ArtistId { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateOnly ReleaseDate { get; set; }
        public IFormFile? CoverFile { get; set; }
        public List<int> TrackIds { get; set; } = new List<int>();
    }
}
