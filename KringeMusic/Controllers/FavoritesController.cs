using Application;
using Application.DTOs.Album;
using Application.DTOs.Track;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace KringeMusic.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly FavoritesService _favoritesService;

        public FavoritesController(FavoritesService favoritesService)
        {
            _favoritesService = favoritesService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User ID not found in token");
            return int.Parse(userIdClaim);
        }

        [HttpPost("like")]
        public async Task<IActionResult> LikeTrack([FromBody] FavoriteActionDto dto)
        {
            var userId = GetCurrentUserId();
            await _favoritesService.AddToFavorites(userId, dto.TrackId, HttpContext.RequestAborted);
            return Ok(new { message = "Трек добавлен в избранное" });
        }

        [HttpPost("unlike")]
        public async Task<IActionResult> UnlikeTrack([FromBody] FavoriteActionDto dto)
        {
            var userId = GetCurrentUserId();
            await _favoritesService.RemoveFromFavorites(userId, dto.TrackId, HttpContext.RequestAborted);
            return Ok(new { message = "Трек удалён из избранного" });
        }

        [HttpGet]
        public async Task<IActionResult> GetFavorites([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userId = GetCurrentUserId();
            var (items, totalCount) = await _favoritesService.GetFavoriteTracks(userId, page, pageSize, HttpContext.RequestAborted);
            return Ok(new { items, totalCount, page, pageSize });
        }

        [HttpPost("likeAlbum")]
        public async Task<IActionResult> LikeAlbum([FromBody] AlbumFavoriteActionDto dto)
        {
            var userId = GetCurrentUserId();
            await _favoritesService.AddAlbumToFavorites(userId, dto.ArtistId, dto.AlbumId, HttpContext.RequestAborted);
            return Ok(new { message = "Альбом добавлен в избранное" });
        }

        [HttpPost("unlikeAlbum")]
        public async Task<IActionResult> UnlikeAlbum([FromBody] AlbumFavoriteActionDto dto)
        {
            var userId = GetCurrentUserId();
            await _favoritesService.RemoveAlbumFromFavorites(userId, dto.ArtistId, dto.AlbumId, HttpContext.RequestAborted);
            return Ok(new { message = "Альбом удалён из избранного" });
        }

        [HttpGet("albums")]
        public async Task<IActionResult> GetFavoriteAlbums([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userId = GetCurrentUserId();
            var (items, totalCount) = await _favoritesService.GetFavoriteAlbums(userId, page, pageSize, HttpContext.RequestAborted);
            return Ok(new { items, totalCount, page, pageSize });
        }
    }
}
