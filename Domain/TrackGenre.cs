using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class TrackGenre
    {
        public int GenreId { get; set; }
        public int TrackId { get; set; }
        public virtual Genre Genre { get; set; } = null!;
        public virtual Track Track { get; set; } = null!;
    }
}
