using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Track
{
    public class PlayHistoryCreateDto
    {
        public int TrackId { get; set; }
        public string Source { get; set; } = "manual";
        public int DurationPlayed { get; set; } = 1;   
        public bool IsSkipped { get; set; } = false;
    }
}
