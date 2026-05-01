using KringeMusic.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class PlayedHistory
    {
        public int HistoryId { get; set; }
        public int UserId { get; set; }
        public int TrackId { get; set; }
        public string Source { get; set; } = string.Empty;
        public int DurationPlayed { get; set; }
        public bool IsSkipped { get; set; }
        public DateTime ListeningDate { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
        public Track? Track { get; set; }
    }
}
