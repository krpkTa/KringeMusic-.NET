namespace KringeMusic.DTOs.Track
{
    public class TrackResponseDto
    {
        public int TrackId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DurationSec { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string TrackUrl { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public List<string> ArtistNames { get; set; } = new();
        public List<string> GenreNames { get; set; } = new();
    }
}
