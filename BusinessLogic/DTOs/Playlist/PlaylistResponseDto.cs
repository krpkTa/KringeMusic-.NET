using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Playlist
{
    public class PlaylistResponseDto
    {
        public int TypeId { get; set; }
        public int UserId { get; set; }
        public int PlaylistId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int TrackCount { get; set; }
        public string? CoverUrl { get; set; }
    }
}
