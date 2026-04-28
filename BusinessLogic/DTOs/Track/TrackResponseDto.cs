namespace KringeMusic.DTOs.Track
{
    public class TrackResponseDto
    {
        
        public int TrackId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Duration { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string? TrackUrl { get; set; }      // ссылка на аудиофайл
        public string? CoverUrl { get; set; }      // ссылка на обложку
        public List<ArtistBriefDto> Artists { get; set; } = new();
        public List<string> Genres { get; set; } = new();
    }

     public class ArtistBriefDto
     {
         public int ArtistId { get; set; }
         public string Name { get; set; } = string.Empty;
         public bool IsPrimary { get; set; }
     }
}
