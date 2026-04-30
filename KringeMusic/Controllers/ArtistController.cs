using Application;
using KringeMusic.DTOs.Artist;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

//[Authorize(Roles = "ADM")]
[ApiController]
[Route("api/[controller]")]
public class ArtistsController : ControllerBase
{
    private readonly ArtistService _artistService;

    public ArtistsController(ArtistService artistService) => _artistService = artistService;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var artists = await _artistService.GetAllAsync(search, page, pageSize, HttpContext.RequestAborted);
        return Ok(artists);
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var artist = await _artistService.GetByIdAsync(id, HttpContext.RequestAborted);
        if (artist == null) return NotFound();
        return Ok(artist);
    }
    [HttpGet("{id}/tracks")]
    public async Task<IActionResult> GetArtistTracks(int id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var tracks = await _artistService.GetArtistTracksAsync(id, page, pageSize, HttpContext.RequestAborted);
        return Ok(tracks);
    }
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] ArtistCreateDto dto)
    {
        var result = await _artistService.CreateAsync(dto.Name, dto.Description, dto.LabelId, dto.GenreIds);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromForm] ArtistUpdateDto dto)
    {
        if (id != dto.ArtistId) return BadRequest("ID mismatch");

        var result = await _artistService.UpdateAsync(dto.ArtistId, dto.Name, dto.Description, dto.LabelId, dto.CoverFile, dto.GenreIds, HttpContext.RequestAborted);

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _artistService.DeleteAsync(id, HttpContext.RequestAborted);
        return NoContent();
    }
}