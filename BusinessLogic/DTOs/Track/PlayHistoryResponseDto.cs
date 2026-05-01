using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Track
{
    public class PlayHistoryResponseDto
    {
        public int HistoryId { get; set; }
        public int TrackId { get; set; }
        public string TrackName { get; set; } = string.Empty;
        public string ArtistName { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;      
        public int DurationPlayed { get; set; }             
        public bool IsSkipped { get; set; }               
        public DateTime ListeningDate { get; set; }          
        public int? TrackDuration { get; set; }
    }
}
