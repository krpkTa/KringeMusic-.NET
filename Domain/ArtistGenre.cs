using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class ArtistGenre
    {
        public int GenreId { get; set; }
        public int ArtistId { get; set; }
        public virtual Genre Genre { get; set; } = null!;
        public virtual Artist Artist { get; set; } = null!;
    }
}
