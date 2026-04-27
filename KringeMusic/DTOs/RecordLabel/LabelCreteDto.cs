namespace KringeMusic.DTOs.RecordLabel
{
    public class LabelCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public int? FoundedYear { get; set; }
        public string? Description { get; set; }
        public IFormFile? LogoFile { get; set; }
    }
}
