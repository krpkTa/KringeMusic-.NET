using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Genre
{
    public class GenreResponseDto
    {
        public int GenreId { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
