using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class PlaylistType
    {
        public int TypeId { get; set; }
        public string Name { get; set; } = string.Empty;

        public virtual ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
    }
}
