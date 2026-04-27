using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Artist
    {
        public int ArtistId { get; set; }
        public int? LabelId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverLink { get; set; }  // URL фото артиста (облако)

        public virtual RecordLabel? Label { get; set; }
       // public virtual ICollection<Album> Albums { get; set; } = new List<Album>();
        public virtual ICollection<ArtistTrack> ArtistTracks { get; set; } = new List<ArtistTrack>();
        public virtual ICollection<ArtistGenre> ArtistGenres { get; set; } = new List<ArtistGenre>();
    }
}
