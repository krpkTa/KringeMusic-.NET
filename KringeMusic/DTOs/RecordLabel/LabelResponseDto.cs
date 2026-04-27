namespace KringeMusic.DTOs.RecordLabel
{
    public class LabelResponseDto
    {
        public int LabelId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public int? FoundedYear { get; set; }
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public int ArtistsCount { get; set; }
    }
}
