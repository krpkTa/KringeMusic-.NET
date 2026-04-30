using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IUserPreferencesRepository
    {
        Task AddGenresToUserAsync(int userId, List<int> genreIds, CancellationToken ct = default);
        Task RemoveAllGenresFromUserAsync(int userId, CancellationToken ct = default);
        Task AddArtistsToUserAsync(int userId, List<int> artistIds, CancellationToken ct = default);
        Task RemoveAllArtistsFromUserAsync(int userId, CancellationToken ct = default);
        Task<List<int>> GetUserGenreIdsAsync(int userId, CancellationToken ct = default);
        Task<List<int>> GetUserArtistIdsAsync(int userId, CancellationToken ct = default);
    }
}
