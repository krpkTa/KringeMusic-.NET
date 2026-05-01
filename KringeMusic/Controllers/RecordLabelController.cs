using Application;
using Application.DTOs.RecordLabel;
using KringeMusic.DTOs.RecordLabel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KringeMusic.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecordLabelController : ControllerBase
    {
        private readonly LabelService _labelService;

        public RecordLabelController(LabelService labelService) => _labelService = labelService;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var labels = await _labelService.GetAllAsync(search, page, pageSize, HttpContext.RequestAborted);
            return Ok(labels);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var label = await _labelService.GetByIdAsync(id, HttpContext.RequestAborted);

            if (label == null) return NotFound($"Лейбл с ID {id} не найден.");

            return Ok(label);
        }
        [Authorize(Roles = "ADM")]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] LabelCreateDto dto)
        {
            var result = await _labelService.CreateAsync(
                dto.Name,
                dto.Country,
                dto.LogoFile,
                HttpContext.RequestAborted);

            return Ok(result);
        }
        [Authorize(Roles = "ADM")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] LabelUpdateDto dto)
        {
            if (id != dto.LabelId) return BadRequest("ID mismathc");

            var result = await _labelService.UpdateAsync
            (
                id,
                dto.Name,
                dto.Country,
                dto.LogoFile,
                HttpContext.RequestAborted
            );

            return Ok(result);
        }
        [Authorize(Roles = "ADM")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _labelService.DeleteAsync(id, HttpContext.RequestAborted);
            return NoContent();
        }
    }
}
