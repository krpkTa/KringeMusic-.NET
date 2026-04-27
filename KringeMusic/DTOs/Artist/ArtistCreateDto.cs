namespace KringeMusic.DTOs.Artist
{
    public class ArtistCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? LabelId { get; set; } 
        public IFormFile? CoverFile { get; set; } 
    }
}
