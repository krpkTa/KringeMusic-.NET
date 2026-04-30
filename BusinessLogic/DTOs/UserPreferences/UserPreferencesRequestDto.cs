using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UserPreferences
{
    public class UserPreferencesRequestDto
    {
        public List<int> GenreIds { get; set; } = new();
        public List<int> ArtistIds { get; set; } = new();
    }
}
