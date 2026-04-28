using Application;
using Application.DTOs.Track;
using KringeMusic.DTOs.Track;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace KringeMusic.Controllers
{
    //[Authorize(Roles = "ADM")]
    [ApiController]
    [Route("api/[controller]")]
    public class TrackController : ControllerBase
    {
        private readonly TrackService _trackService;

        public TrackController(TrackService trackService) => _trackService = trackService;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var tracks = await _trackService.GetAllAsync(search, page, pageSize);
            return Ok(tracks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var tracks = await _trackService.GetByIdAsync(id, HttpContext.RequestAborted);

            if(tracks == null)
                return NotFound();

            return Ok(tracks);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] TrackCreateDto dto)
        {
            try
            {
                var artistAssignments = DeserializeArtists(dto.ArtistsJson);
                var genreIds = DeserializeInts(dto.GenreIdsJson);
                var artistIds = artistAssignments.Select(a => a.ArtistId).ToList();
                var isPrimaryFlags = artistAssignments.Select(a => a.IsPrimary).ToList();

                var result = await _trackService.CreateAsync(
                    dto.Name,
                    dto.Duration,
                    dto.ReleaseDate,
                    dto.TrackFile,
                    dto.CoverFile,
                    artistIds,
                    isPrimaryFlags,
                    genreIds,
                    HttpContext.RequestAborted);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] TrackUpdateDto dto)
        {
            if (id != dto.TrackId)
                return BadRequest("ID mismatch");

            try
            {

                var artistAssignments = DeserializeArtists(dto.ArtistsJson);
                var genreIds = DeserializeInts(dto.GenreIdsJson);
                var artistIds = artistAssignments.Select(a => a.ArtistId).ToList();
                var isPrimaryFlags = artistAssignments.Select(a => a.IsPrimary).ToList();
                

                var result = await _trackService.UpdateAsync(
                    dto.TrackId,
                    dto.Name,
                    dto.Duration,
                    dto.ReleaseDate,
                    dto.TrackFile,
                    dto.CoverFile,
                    artistIds,
                    isPrimaryFlags,
                    genreIds,
                    HttpContext.RequestAborted);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _trackService.DeleteAsync(id, HttpContext.RequestAborted);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        private List<ArtistAssignment> DeserializeArtists(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
                return new List<ArtistAssignment>();

            json = json.Trim();
            if (json.StartsWith('['))
            {
                return JsonSerializer.Deserialize<List<ArtistAssignment>>(json)
                       ?? new List<ArtistAssignment>();
            }
            else
            {
                var single = JsonSerializer.Deserialize<ArtistAssignment>(json);
                return single == null ? new List<ArtistAssignment>() : new List<ArtistAssignment> { single };
            }
        }

        private List<int> DeserializeInts(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
                return new List<int>();

            json = json.Trim();
            if (json.StartsWith('['))
            {
                return JsonSerializer.Deserialize<List<int>>(json)
                       ?? new List<int>();
            }
            else
            {
                if (int.TryParse(json, out var single))
                    return new List<int> { single };
                return new List<int>();
            }
        }
    }
}
