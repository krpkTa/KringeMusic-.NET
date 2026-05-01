using Application;
using Application.DTOs.Genre;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KringeMusic.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    public class GenreController : ControllerBase
    {
        private readonly GenreService _genreService;
        public GenreController(GenreService genreService) => _genreService = genreService;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var genres = await _genreService.GetPaginatedAsync(search, page, pageSize, HttpContext.RequestAborted);
            return Ok(genres);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var genre = await _genreService.GetByIdAsync(id, HttpContext.RequestAborted);
            if (genre == null) return NotFound();
            return Ok(genre);
        }
        [Authorize(Roles = "ADM")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] GenreCreateDto dto)
        {
            try
            {
                var result = await _genreService.CreateAsync(dto.Name, HttpContext.RequestAborted);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize(Roles = "ADM")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] GenreUpdateDto dto)
        {
            if (id != dto.GenreId) return BadRequest("ID mismatch");
            try
            {
                var result = await _genreService.UpdateAsync(id, dto.Name, HttpContext.RequestAborted);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "ADM")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _genreService.DeleteAsync(id, HttpContext.RequestAborted);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
