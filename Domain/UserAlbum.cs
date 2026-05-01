using KringeMusic.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    [Table("user_albums")]
    public class UserAlbum
    {
        [Column("artist_id")]
        public int ArtistId { get; set; }

        [Column("album_id")]
        public int AlbumId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [ForeignKey("ArtistId, AlbumId")]
        public Album? Album { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
