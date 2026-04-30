using KringeMusic.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class UserArtist
    {
        public int UserId { get; set; }
        public int ArtistId { get; set; }
        public virtual User? User { get; set; }
        public virtual Artist? Artist { get; set; }
    }
}
