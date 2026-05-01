using Application;
using KringeMusic.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace KringeMusic.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DailyPlaylistController : ControllerBase
    {
        private readonly DailyPlaylistService _dailyService;
        public DailyPlaylistController(DailyPlaylistService dailyService) => _dailyService = dailyService;

        private int GetCurrentUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<IActionResult> GetDailyPlaylist(CancellationToken ct)
        {
            var playlist = await _dailyService.GetOrGenerateDailyPlaylist(GetCurrentUserId(), ct);
            return Ok(playlist);
        }
        [HttpPost("regenerate")]
        public async Task<IActionResult> RegenerateDailyPlaylist(CancellationToken ct)
        {
            var userId = GetCurrentUserId();
            var playlist = await _dailyService.RegenerateDailyPlaylistForce(userId, ct);
            return Ok(playlist);
        }
    }
}
