using Application;
using Application.DTOs.UserPreferences;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace KringeMusic.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserPreferencesController : ControllerBase
    {
        private readonly UserPreferencesService _userPreferencesService;
        public UserPreferencesController(UserPreferencesService userPreferencesService) => _userPreferencesService = userPreferencesService;
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User ID not found in token");
            return int.Parse(userIdClaim);
        }

        [HttpPost]
        public async Task<IActionResult> SavePreferences([FromBody] UserPreferencesRequestDto dto)
        {
            var userId = GetUserId();
            await _userPreferencesService.SavePreferencesAsync(userId, dto, HttpContext.RequestAborted);
            return Ok(new { message = "Preferences saved successfully" });
        }

        [HttpGet]
        public async Task<IActionResult> GetPreferences()
        {
            var userId = GetUserId();
            var preferences = await _userPreferencesService.GetPreferencesAsync(userId, HttpContext.RequestAborted);
            return Ok(preferences);
        }
    }
}
