using Microsoft.AspNetCore.Mvc;
using Npgsql;

[ApiController]
[Route("api/[controller]")]
public class TestDbController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public TestDbController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<IActionResult> CheckConnection()
    {
        var connectionString = _configuration.GetConnectionString("Database");
        try
        {
            await using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();
            await using var cmd = new NpgsqlCommand("SELECT 1", conn);
            var result = await cmd.ExecuteScalarAsync();
            return Ok($"✅ Подключение успешно, результат: {result}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"❌ Ошибка подключения: {ex.Message}\n{ex.InnerException?.Message}");
        }
    }
}