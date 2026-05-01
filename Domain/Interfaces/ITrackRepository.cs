using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface ITrackRepository
    {
        Task<Track?> GetTrackById(int id, CancellationToken ct);
        Task<Track?> GetTrackByName(string name, CancellationToken ct);
        Task<Track?> GetTrackWithDetails(int id, CancellationToken ct); // with artists & genres
        Task<List<Track>> GetTracksPaginated(string? search, int page, int pageSize, CancellationToken ct);
        Task CreateTrack(Track track, CancellationToken ct);
        Task UpdateTrack(Track track, CancellationToken ct);
        Task DeleteTrack(int id, CancellationToken ct);

        Task AddArtistToTrack(int trackId, int artistId, bool isPrimary, CancellationToken ct);
        Task AddGenreToTrack(int trackId, int genreId, CancellationToken ct);
        Task RemoveAllArtistsFromTrack(int trackId, CancellationToken ct);
        Task RemoveAllGenresFromTrack(int trackId, CancellationToken ct);

        Task<bool> ExistsArtist(int artistId, CancellationToken ct);
        Task<bool> ExistsGenre(int genreId, CancellationToken ct);
        Task<bool> ExistsAsync(int genreId, CancellationToken ct);
        Task<List<Track>> GetRecommendedTracks(List<int> genreIds, List<int> artistIds, int limit, CancellationToken ct);
        Task<List<Track>> GetTopTracks(int limit, CancellationToken ct);
    }
}
