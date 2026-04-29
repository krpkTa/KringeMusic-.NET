using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class AlbumTrack
    {
        [Column("artist_id")]
        public int ArtistId { get; set; }

        [Column("album_id")]
        public int AlbumId { get; set; }

        [Column("track_id")]
        public int TrackId { get; set; }

        
        public virtual Album Album { get; set; } = null!;
        public virtual Track Track { get; set; } = null!;
    }
}
