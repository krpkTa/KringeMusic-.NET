using KringeMusic.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IArtistRepository
    {
        Task<Artist>? GetArtistByName(string name, CancellationToken ct);
        Task<Artist> GetArtistById(int id, CancellationToken ct);
        Task CreateArtist(Artist artist, CancellationToken ct);
        Task<Artist?> GetArtistByIdWithLabel(int id, CancellationToken ct);
        Task<List<Artist>> GetArtistsPaginated(string? search, int page, int pageSize, CancellationToken ct);
        Task UpdateArtist(Artist artist, CancellationToken ct);
        Task DeleteArtist(int id, CancellationToken ct);
        Task AddGenresToArtist(int artistId, List<int> genreIds, CancellationToken ct);
        Task RemoveAllGenresFromArtist(int artistId, CancellationToken ct);
        Task<Artist?> GetArtistWithDetails(int id, CancellationToken ct);
        Task<int> GetTracksCountAsync(int artistId, CancellationToken ct);
        Task<bool> ExistsById(int artistId, CancellationToken ct);
    }
}
