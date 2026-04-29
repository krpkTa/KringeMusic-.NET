using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Album
{
    public class AlbumUpdateDto : AlbumCreateDto
    {
        public int AlbumId { get; set; }
    }
}
