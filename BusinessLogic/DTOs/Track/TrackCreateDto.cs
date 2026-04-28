using Application.DTOs.Track;
using Microsoft.AspNetCore.Http;

namespace KringeMusic.DTOs.Track
{
    public class TrackCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public int Duration { get; set; }
        public DateTime ReleaseDate { get; set; }
        public IFormFile? TrackFile { get; set; }
        public IFormFile? CoverFile { get; set; }
        public string ArtistsJson { get; set; } = "[]";
        public string GenreIdsJson { get; set; } = "[]";
    }
}
