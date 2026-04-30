using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Track
    {
        public int TrackId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Duration { get; set; }          // секунды
        public DateTime ReleaseDate { get; set; }
        public string TrackLink { get; set; } = string.Empty;   // ссылка на аудио
        public string? CoverLink { get; set; }      // обложка трека

        public virtual ICollection<ArtistTrack> ArtistTracks { get; set; } = new List<ArtistTrack>();
        public virtual ICollection<TrackGenre> TrackGenres { get; set; } = new List<TrackGenre>();
        public virtual ICollection<AlbumTrack> AlbumTracks { get; set; } = new List<AlbumTrack>();
        public virtual ICollection<PlaylistTrack> PlaylistTracks { get; set; } = new List<PlaylistTrack>();
    }
}
