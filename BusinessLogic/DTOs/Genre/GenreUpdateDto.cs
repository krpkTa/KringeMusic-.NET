using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Genre
{
    public class GenreUpdateDto : GenreCreateDto
    {
        public int GenreId { get; set; }
    }
}
