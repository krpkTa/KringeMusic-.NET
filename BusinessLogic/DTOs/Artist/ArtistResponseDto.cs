namespace KringeMusic.DTOs.Artist
{
    public class ArtistResponseDto
    {
        public int ArtistId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }        
        public string? LabelName { get; set; }
        public int AlbumsCount { get; set; }        
        public int TracksCount { get; set; }       
        public List<string> Genres { get; set; } = new List<string>();
    }
}
