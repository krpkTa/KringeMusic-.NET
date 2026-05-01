using Application;
using Application.DTOs.Playlist;
using KringeMusic.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace KringeMusic.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PlaylistsController : ControllerBase
    {
        private readonly PlaylistService _playlistService;

        public PlaylistsController(PlaylistService playlistService)
        {
            _playlistService = playlistService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User ID not found");
            return int.Parse(userIdClaim);
        }

        [HttpGet]
        public async Task<IActionResult> GetUserPlaylists(CancellationToken ct)
        {
            var userId = GetCurrentUserId();
            var playlists = await _playlistService.GetUserPlaylistsAsync(userId, ct);
            return Ok(playlists);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePlaylist([FromBody] PlaylistCreateDto dto, CancellationToken ct)
        {
            var userId = GetCurrentUserId();
            var result = await _playlistService.CreatePlaylistAsync(userId, dto.Name, ct);
            return Ok(result);
        }

        [HttpDelete("{typeId}/{userId}/{playlistId}")]
        public async Task<IActionResult> DeletePlaylist(int typeId, int userId, int playlistId, CancellationToken ct)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId != userId)
                return Forbid();

            await _playlistService.DeletePlaylistAsync(typeId, userId, playlistId, ct);
            return Ok(new { message = "Playlist deleted" });
        }

        [HttpGet("{typeId}/{userId}/{playlistId}/tracks")]
        public async Task<IActionResult> GetPlaylistTracks(int typeId, int userId, int playlistId,
            [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId != userId)
                return Forbid();

            var (items, totalCount) = await _playlistService.GetPlaylistTracksAsync(typeId, userId, playlistId, page, pageSize, ct);
            return Ok(new { items, totalCount, page, pageSize });
        }

        [HttpPost("{typeId}/{userId}/{playlistId}/tracks")]
        public async Task<IActionResult> AddTrackToPlaylist(int typeId, int userId, int playlistId,
            [FromBody] AddTrackToPlaylistDto dto, CancellationToken ct)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId != userId)
                return Forbid();

            await _playlistService.AddTrackToPlaylistAsync(typeId, userId, playlistId, dto.TrackId, ct);
            return Ok(new { message = "Track added" });
        }

        [HttpDelete("{typeId}/{userId}/{playlistId}/tracks")]
        public async Task<IActionResult> RemoveTrackFromPlaylist(int typeId, int userId, int playlistId,
            [FromBody] AddTrackToPlaylistDto dto, CancellationToken ct)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId != userId)
                return Forbid();

            await _playlistService.RemoveTrackFromPlaylistAsync(typeId, userId, playlistId, dto.TrackId, ct);
            return Ok(new { message = "Track removed" });
        }
    }
}
