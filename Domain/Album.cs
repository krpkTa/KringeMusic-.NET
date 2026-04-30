using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Album
    {
        [Column("artist_id")]
        public int ArtistId { get; set; }

        [Column("album_id")]
        public int AlbumId { get; set; }

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("release_date")]
        public DateOnly ReleaseDate { get; set; }

        [Column("cover_link")]
        public string? CoverLink { get; set; }

        public virtual Artist Artist { get; set; } = null!;
        public virtual ICollection<AlbumTrack> AlbumTracks { get; set; } = new List<AlbumTrack>();
    }
}
