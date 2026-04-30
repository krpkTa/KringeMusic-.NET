using Application;
using Microsoft.AspNetCore.Mvc;

namespace KringeMusic.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly SearchService _searchService;

        public SearchController(SearchService searchService) => _searchService = searchService;

        [HttpGet("tracks")]
        public async Task<IActionResult> SearchTracks([FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _searchService.SearchTracksAsync(q, page, pageSize, HttpContext.RequestAborted);
            return Ok(result);
        }
        [HttpGet("artists")]
        public async Task<IActionResult> SearchArtists([FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _searchService.SearchArtistsAsync(q, page, pageSize, HttpContext.RequestAborted);
            return Ok(result);
        }
    }
}
