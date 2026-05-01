using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IAlbumRepository
    {
        Task<Album?> GetAlbumAsync(int artistId, int albumId, CancellationToken ct = default);
        Task<Album?> GetAlbumWithDetailsAsync(int artistId, int albumId, CancellationToken ct = default);
        Task<List<Album>> GetAlbumsByArtistAsync(int artistId, int page, int pageSize, CancellationToken ct = default);
        Task<int> GetNextAlbumIdAsync(int artistId, CancellationToken ct = default);
        Task CreateAlbumAsync(Album album, CancellationToken ct = default);
        Task UpdateAlbumAsync(Album album, CancellationToken ct = default);
        Task DeleteAlbumAsync(int artistId, int albumId, CancellationToken ct = default);
        Task AddTracksToAlbumAsync(int artistId, int albumId, List<int> trackIds, CancellationToken ct = default);
        Task RemoveTracksFromAlbumAsync(int artistId, int albumId, List<int> trackIds, CancellationToken ct = default);
        Task<bool> IsTrackInAlbumAsync(int artistId, int albumId, int trackId, CancellationToken ct = default);
        Task<int> GetTracksCountAsync(int artistId, int albumId, CancellationToken ct = default);
        Task AddToFavoritesAsync(int userId, int artistId, int albumId, CancellationToken ct = default);
        Task RemoveFromFavoritesAsync(int userId, int artistId, int albumId, CancellationToken ct = default);
        Task<bool> IsAlbumInFavoritesAsync(int userId, int artistId, int albumId, CancellationToken ct = default);
        Task<(List<Album> Albums, int TotalCount)> GetFavoriteAlbumsAsync(int userId, int page, int pageSize, CancellationToken ct = default);
    }
}
