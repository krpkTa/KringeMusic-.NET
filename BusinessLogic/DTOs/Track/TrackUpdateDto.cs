using KringeMusic.DTOs.Track;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Track
{
    public class TrackUpdateDto : TrackCreateDto
    {
        public int TrackId { get; set; }
    }
}
