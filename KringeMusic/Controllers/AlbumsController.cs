using Application;
using Application.DTOs.Album;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KringeMusic.Controllers
{
    [ApiController]
    [Route("api/artists/{artistId}/albums")]
    public class AlbumsController : ControllerBase
    {
        private readonly AlbumService _albumService;

        public AlbumsController(AlbumService albumService)
        {
            _albumService = albumService;
        }

        [HttpGet]
        public async Task<IActionResult> GetArtistAlbums(
            int artistId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var albums = await _albumService.GetArtistAlbumsAsync(artistId, page, pageSize, HttpContext.RequestAborted);
            return Ok(albums);
        }

        [HttpGet("{albumId}")]
        public async Task<IActionResult> GetById(int artistId, int albumId)
        {
            var album = await _albumService.GetByIdAsync(artistId, albumId, HttpContext.RequestAborted);
            if (album == null) return NotFound();
            return Ok(album);
        }
        [Authorize(Roles = "ADM")]
        [HttpPost]
        public async Task<IActionResult> Create(int artistId, [FromForm] AlbumCreateDto dto)
        {
            if (artistId != dto.ArtistId)
                return BadRequest("Artist ID mismatch");

            var result = await _albumService.CreateAsync(dto, HttpContext.RequestAborted);
            return CreatedAtAction(nameof(GetById), new { artistId = result.ArtistId, albumId = result.AlbumId }, result);
        }
        [Authorize(Roles = "ADM")]
        [HttpPut("{albumId}")]
        public async Task<IActionResult> Update(int artistId, int albumId, [FromForm] AlbumUpdateDto dto)
        {
            if (artistId != dto.ArtistId || albumId != dto.AlbumId)
                return BadRequest("ID mismatch");

            var result = await _albumService.UpdateAsync(dto, HttpContext.RequestAborted);
            return Ok(result);
        }
        [Authorize(Roles = "ADM")]
        [HttpDelete("{albumId}")]
        public async Task<IActionResult> Delete(int artistId, int albumId)
        {
            await _albumService.DeleteAsync(artistId, albumId, HttpContext.RequestAborted);
            return NoContent();
        }
        [Authorize(Roles = "ADM")]
        [HttpPost("{albumId}/tracks")]
        public async Task<IActionResult> AddTracks(int artistId, int albumId, [FromBody] AddTrackToAlbumDto dto)
        {
            await _albumService.AddTracksToAlbumAsync(artistId, albumId, dto, HttpContext.RequestAborted);
            return NoContent();
        }
        [Authorize(Roles = "ADM")]
        [HttpDelete("{albumId}/tracks")]
        public async Task<IActionResult> RemoveTracks(int artistId, int albumId, [FromBody] AddTrackToAlbumDto dto)
        {
            await _albumService.RemoveTracksFromAlbumAsync(artistId, albumId, dto, HttpContext.RequestAborted);
            return NoContent();
        }
    }
}
