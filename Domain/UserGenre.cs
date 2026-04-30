using KringeMusic.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class UserGenre
    {
        public int UserId { get; set; }
        public int GenreId { get; set; }

        public virtual User? User { get; set; }
        public virtual Genre? Genre { get; set; }

    }
}
