using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class PlaylistTrack
    {
        public int TrackId { get; set; }
        public int TypeId { get; set; }
        public int UserId { get; set; }
        public int PlaylistId { get; set; }
        public DateTime? AddedAt { get; set; }

        public virtual Track? Track { get; set; }
        public virtual Playlist? Playlist { get; set; }
    }
}
