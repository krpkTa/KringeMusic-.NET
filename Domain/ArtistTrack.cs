using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class ArtistTrack
    {
        public int TrackId { get; set; }
        public int ArtistId { get; set; }
        public bool IsPrimary { get; set; } = false;

        public virtual Track Track { get; set; } = null!;
        public virtual Artist Artist { get; set; } = null!;
    }
}
