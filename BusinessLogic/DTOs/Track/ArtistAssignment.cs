using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Application.DTOs.Track
{
    public class ArtistAssignment
    {
        [JsonPropertyName("artistId")] // или "ArtistId", на ваш выбор
        public int ArtistId { get; set; }

        [JsonPropertyName("isPrimary")]
        public bool IsPrimary { get; set; }
    }
}
