namespace KringeMusic.DTOs.Track
{
    public class TrackCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public int Duration { get; set; }
        public DateTime ReleaseDate { get; set; }
        public int PrimaryArtistId { get; set; }
        public List<int>? AdditionalArtistIds { get; set; } // дополнительные (опционально)
        public List<string>? GenreNames { get; set; }      // новые жанры или существующие названия
        public IFormFile? AudioFile { get; set; }          // обязателен
        public IFormFile? CoverFile { get; set; }
    }
}
