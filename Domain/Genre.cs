using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Genre
    {
        public int GenreId { get; set; }
        public string Name { get; set; } = string.Empty;
        public virtual ICollection<TrackGenre> TrackGenres { get; set; } = new List<TrackGenre>();
        public virtual ICollection<ArtistGenre> ArtistGenres { get; set; } = new List<ArtistGenre>();
    }
}
