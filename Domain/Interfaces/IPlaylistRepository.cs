using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IPlaylistRepository
    {
        Task<Playlist?> GetSystemFavoritesPlaylist(int userId, CancellationToken ct = default);
        Task<Playlist> CreateSystemPlaylist(int userId, string name, CancellationToken ct = default);
        Task<bool> IsTrackInFavorites(int userId, int trackId, CancellationToken ct = default);
        Task AddTrackToPlaylist(int typeId, int userId, int playlistId, int trackId, CancellationToken ct = default);
        Task RemoveTrackFromPlaylist(int typeId, int userId, int playlistId, int trackId, CancellationToken ct = default);
        Task<List<Track>> GetFavoriteTracks(int userId, int page, int pageSize, CancellationToken ct = default);
        Task<int> GetFavoriteTracksCount(int userId, CancellationToken ct = default);
    }
}
