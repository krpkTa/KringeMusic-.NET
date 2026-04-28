using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Track
{
    public class TrackUpdateDto
    {
        public int TrackId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Duration { get; set; }
        public DateTime ReleaseDate { get; set; }
        public IFormFile? TrackFile { get; set; }
        public IFormFile? CoverFile { get; set; }
        public string ArtistsJson { get; set; } = "[]";
        public string GenreIdsJson { get; set; } = "[]";
    }
}
