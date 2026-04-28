using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
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
        [Column("cover_link")]
        public string? CoverLink { get; set; }

        public virtual RecordLabel? Label { get; set; }
       // public virtual ICollection<Album> Albums { get; set; } = new List<Album>();
        public virtual ICollection<ArtistTrack> ArtistTracks { get; set; } = new List<ArtistTrack>();
        public virtual ICollection<ArtistGenre> ArtistGenres { get; set; } = new List<ArtistGenre>();
    }
}
