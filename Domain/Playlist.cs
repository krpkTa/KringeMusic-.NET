using KringeMusic.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Playlist
    {
        public int TypeId { get; set; }
        public int UserId { get; set; }
        public int PlaylistId { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public virtual PlaylistType? Type { get; set; }
        public virtual User? User { get; set; }
        public virtual ICollection<PlaylistTrack> PlaylistTracks { get; set; } = new List<PlaylistTrack>();
    }
}
